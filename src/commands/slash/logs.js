const config = require("../../../config.js");
const { InteractionContextType, MessageFlags } = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getlogContainer } = require("../../../components/logContainer.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();
  if (serv === "non-lie") {
    const nonLieContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: '## :no_entry_sign: Compte non Lié',
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: 'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.',
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: '💻 Accéder au panel',
                        url: 'https://glorybot.fr',
                        style: ButtonStyle.Link,
                    },
                ],
            },
      ],
    };
    return interaction.reply({ components: [nonLieContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
  }

  if (serv === "permission") {
    const permissionContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: '## :no_entry_sign: Permission Refusée',
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Tu n'as pas la permission d'effectuer cette commande !",
        },
      ],
    };
    return interaction.reply({ components: [permissionContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
  }

  if (!config.liste_serveur.includes(serv)) {
    const unknownServerContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: '## :no_entry_sign: Serveur Inconnu',
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Le serveur **${serv}** n'est pas un serveur reconnu. Veuillez fournir un serveur valide.`,
        },
      ],
    };
    return interaction.reply({ components: [unknownServerContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
  }

  const response = await fetch(
    config.glorystaff_url + "/api/get-staff?discordId=" + interaction.user.id
  );
  const servers = await response.json();
  if (!servers.includes(serv)) {
    const capitalizedServeur = serv.charAt(0).toUpperCase() + serv.slice(1);
    const emojiId = config.emoji[serv.toLowerCase()];
    const permissionContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: '## :no_entry_sign: Permission Refusée',
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Tu n'as pas la permission d'effectuer cette commande pour le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
        },
      ],
    };
    return interaction.reply({ components: [permissionContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
  }

  const panel = interaction.options.getString("panel").toLowerCase();

  const serverDatas = await getServerDatas(interaction);
  const logContainer = await getlogContainer(serverDatas, panel, serv, 1);
  return interaction.reply({
    components: [logContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "logs",
  description: "Affiche les logs des modifications des panels rôle-play",
  options: [
    {
      type: 3,
      name: "serveur",
      description: "Serveur sur lequel voir les logs",
      autocomplete: true,
      required: true,
    },
    {
      type: 3,
      name: "panel",
      description: "Panel sur lequel voir les logs",
      autocomplete: true,
      required: true,
    },
  ],
  contexts: [InteractionContextType.Guild],
  async autocomplete(client, interaction, config) {
    const response = await fetch(
      config.glorystaff_url + "/api/get-staff?discordId=" + interaction.user.id
    );
    const servers = await response.json();
    const respondDatas = [];
    for (serv of servers) {
      const servname = serv.charAt(0).toUpperCase() + serv.slice(1);
      respondDatas.push({ name: servname, value: serv });
    }

    if (servers.length === 0) {
      let pseudo;
      try {
        const response = await fetch(
          `${config.glorybot_url}/api/get-ng?discordId=${interaction.user.id}`
        );
        const data = await response.json();
        pseudo = data.pseudo || null;
      } catch (e) {
        pseudo = null;
      }
      if (!pseudo) {
        return await interaction.respond([
          {
            name: "Compte NationsGlory non lié, fait le maintenant : https://glorybot.fr",
            value: "non-lie",
          },
        ]);
      } else {
        return await interaction.respond([
          {
            name: "Vous n'êtes staff d'aucun serveur de NationsGlory.",
            value: "permission",
          },
        ]);
      }
    }
    await interaction.respond(respondDatas);
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
