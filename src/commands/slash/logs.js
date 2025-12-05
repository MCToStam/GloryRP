const {
  InteractionContextType,
  SeparatorSpacingSize,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getLogContainer } = require("../../../components/logContainer.js");
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
              url: "https://glorybot.fr/user/profile",
              label: "🔗 Lier son Compte",
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

  const { pseudonym, servers } = await discordStaff(interaction.user.id);
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

  const [type, panelId] = interaction.options.getString("panel").split("-");

  const serverDatas = await getServerDatas(interaction, serv);
  const { error, component: logContainer } = await getLogContainer(
    serverDatas,
    panelId,
    serv,
    1,
    type,
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
        return interaction.respond([
          {
            name: "Compte NationsGlory non lié, fais-le maintenant : https://glorybot.fr",
            value: "non-lie",
          },
        ]);
      }

      if (!servers || servers.length === 0) {
        return interaction.respond([
          {
            name: "Vous n'êtes opérateur d'aucun serveur de NationsGlory.",
            value: "permission",
          },
        ]);
      }

      const focusedValue =
        interaction.options.getFocused()?.toLowerCase() ?? "";
      const filtered = servers
        .filter((serv) => serv.toLowerCase().includes(focusedValue))
        .slice(0, 25)
        .map((serv) => ({
          name: serv.charAt(0).toUpperCase() + serv.slice(1),
          value: serv,
        }));

      await interaction.respond(filtered);
    }

    if (focusedOption.name === "panel") {
      const serveur = interaction.options.getString("serveur");
      if (!serveur) {
        return await interaction.respond([
          { name: "Sélectionne d'abord un serveur", value: "no-server" },
        ]);
      }

      const focusedValue =
        interaction.options.getFocused()?.toLowerCase() ?? "";

      try {
        const json = await getServerDatas(false, serveur);

        if (!json.panels || json.panels.length === 0) {
          return await interaction.respond([
            {
              name: "Aucun rôle-play trouvé pour ce serveur",
              value: "no-panel",
            },
          ]);
        }

        const panels = json.panels.map((p) => ({
          name: `[Rôle-Play] ${p.name}`,
          value: `panel-${String(p.id)}`,
        }));

        const boutiques = json.boutiques.map((b) => ({
          name: `[Boutique] ${b.name}`,
          value: `boutique-${String(b.id)}`,
        }));

        const donnee = [...panels, ...boutiques].filter((data) =>
          data.name.toLowerCase().includes(focusedValue),
        );

        return await interaction.respond(donnee.slice(0, 25));
      } catch (err) {
        console.log(err);
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
