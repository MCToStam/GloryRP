const config = require("../../../config.js");
const fs = require("node:fs");
const path = require("node:path");
const {
  InteractionContextType,
  SeparatorSpacingSize,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getlogContainer } = require("../../../components/logContainer.js");
const { discordStaff } = require("../../../utils/functions/linkedUser.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();
  if (serv === "non-lie") {
    const nonLieContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Compte non Lié",
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.',
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
              label: "💻 Accéder au panel",
              url: "https://glorybot.fr",
              style: ButtonStyle.Link,
            },
          ],
        },
      ],
    };
    return interaction.reply({
      components: [nonLieContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  if (serv === "permission") {
    const permissionContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Permission Refusée",
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
    return interaction.reply({
      components: [permissionContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  if (!config.liste_serveur.includes(serv)) {
    const unknownServerContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Serveur Inconnu",
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
    return interaction.reply({
      components: [unknownServerContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
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
          content: "## :no_entry_sign: Permission Refusée",
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
    return interaction.reply({
      components: [permissionContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const panelId = interaction.options.getString("panel").toLowerCase();

  const serverDatas = await getServerDatas(interaction, serv);
  const { error, component: logContainer } = await getlogContainer(
    serverDatas,
    panelId,
    serv,
    1
  );
  return interaction.reply({
    components: [logContainer],
    flags: error
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2,
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
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "serveur") {
      const { pseudonym, servers } = await discordStaff(interaction.user.id);
      if (!pseudonym) {
        return await interaction.respond([
          {
            name: "Compte NationsGlory non lié, fait le maintenant : https://glorybot.fr",
            value: "non-lie",
          },
        ]);
      } else if (pseudonym && servers.length === 0) {
        return await interaction.respond([
          {
            name: "Vous n'êtes opérateur d'aucun serveur de NationsGlory.",
            value: "permission",
          },
        ]);
      }

      const respondDatas = servers.map((serv) => {
        const servname = serv.charAt(0).toUpperCase() + serv.slice(1);
        return { name: servname, value: serv };
      });
      await interaction.respond(respondDatas);
    }

    if (focusedOption.name === "panel") {
      const serveur = interaction.options.getString("serveur");
      if (!serveur) {
        return await interaction.respond([
          { name: "Sélectionne d'abord un serveur", value: "no-server" },
        ]);
      }

      try {
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "data",
          "servers",
          `${serveur}.json`
        );
        if (!fs.existsSync(filePath)) {
          return await interaction.respond([
            { name: "Aucun fichier trouvé pour ce serveur", value: "no-file" },
          ]);
        }

        const rawData = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(rawData);

        if (!json.panels || json.panels.length === 0) {
          return await interaction.respond([
            {
              name: "Aucun rôle-play trouvé pour ce serveur",
              value: "no-panel",
            },
          ]);
        }

        const panels = json.panels.map((p) => ({
          name: p.name,
          value: String(p.id),
        }));

        return await interaction.respond(panels.slice(0, 25));
      } catch (err) {
        return await interaction.respond([
          { name: "Erreur lors de la lecture des panels", value: "error" },
        ]);
      }
    }
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
