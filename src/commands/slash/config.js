const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers");
const { discordStaff } = require("../../../utils/functions/linkedUser.js");
const {
  getServerCommand,
} = require("../../../utils/functions/getServerCommand");

exports.run = async (client, interaction, config) => {
  const serveur =
    interaction.options.getString("serveur")?.toLowerCase() ||
    (await getServerCommand(interaction.guild.id));

  if (!serveur) {
    const nonServeurContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Aucun Serveur",
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            "Aucun serveur par défaut n'a été trouvé sur ce serveur Discord, veuillez en spécifier un manuellement.",
        },
      ],
    };
    return interaction.reply({
      components: [nonServeurContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (serveur === "non-lie") {
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
          spacing: 2,
        },
        {
          type: 10,
          content:
            'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.',
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: "https://glorybot.fr/user/profile",
              label: "🔗 Lier son Compte",
              style: 5,
            },
          ],
        },
      ],
    };
    return interaction.reply({
      components: [nonLieContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (serveur === "permission") {
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
          spacing: 2,
        },
        {
          type: 10,
          content: "Tu n'as pas la permission d'effectuer cette commande !",
        },
      ],
    };
    return interaction.reply({
      components: [permissionContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (!config.liste_serveur.includes(serveur)) {
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
          spacing: 2,
        },
        {
          type: 10,
          content: `Le serveur **${serveur}** n'est pas un serveur reconnu. Veuillez fournir un serveur valide.`,
        },
      ],
    };
    return interaction.reply({
      components: [unknownServerContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const { pseudonyme_staff, servers } = await discordStaff(interaction.user.id);
  if (!servers.includes(serveur)) {
    const capitalizedServeur =
      serveur.charAt(0).toUpperCase() + serveur.slice(1);
    const emojiId = config.emoji[serveur.toLowerCase()];
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
          spacing: 2,
        },
        {
          type: 10,
          content: `Tu n'as pas la permission d'effectuer cette commande pour le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
        },
      ],
    };
    return interaction.reply({
      components: [permissionContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const serverDatas = await getServerDatas(interaction, serveur);
  const configContainer = await getConfigContainer(serverDatas, serveur);
  return interaction.reply({
    components: [configContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config",
  description: "Configure le rôle-play de ton serveur",
  options: [
    {
      type: 3,
      name: "serveur",
      description: "Serveur que tu souhaites configurer",
      autocomplete: true,
      required: false,
    },
  ],
  contexts: [0],
  async autocomplete(client, interaction, config) {
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

    const focusedValue = interaction.options.getFocused()?.toLowerCase() ?? "";
    const filtered = servers
      .filter((serv) => serv.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map((serv) => ({
        name: serv.charAt(0).toUpperCase() + serv.slice(1),
        value: serv,
      }));

    await interaction.respond(filtered);
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
};
