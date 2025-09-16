const config = require("../../../config.js");
const { InteractionContextType, MessageFlags } = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getlogContainer } = require("../../../components/logContainer.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();

  if (serv === "non-lie") {
    const erreurEmbed = new EmbedBuilder()
      .setTitle("Erreur")
      .setColor(config.errorcolor)
      .setDescription(
        'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.'
      )
      .setFooter({ text: config.footer });

    const panelButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("💻 Accéder au panel")
        .setStyle(ButtonStyle.Link)
        .setURL("https://glorybot.fr")
    );

    return interaction.reply({
      embeds: [erreurEmbed],
      components: [panelButton],
      ephemeral: true,
    });
  }

  if (!config.liste_serveur.includes(serv)) {
    const unknownServerEmbed = {
      title: "Erreur",
      description: `Le serveur **${serv}** n'est pas un serveur reconnu. Veuillez fournir un serveur valide.`,
      color: config.errorcolor,
      footer: { text: config.footer },
    };
    return interaction.reply({ embeds: [unknownServerEmbed], ephemeral: true });
  }

  const capitalizedServeur = serv.charAt(0).toUpperCase() + serv.slice(1);
  const emojiId = config.emoji[serv.toLowerCase()];

  if (serv === "permission") {
    const permissionEmbed = {
      title: "Erreur",
      description: `Tu n'as pas la permission d'effectuer cette commande !`,
      color: config.errorcolor,
      footer: { text: config.footer },
    };
    return interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
  }

  const response = await fetch(
    config.glorystaff_url + "/api/get-staff?discordId=" + interaction.user.id
  );
  const servers = await response.json();
  if (!servers.includes(serv)) {
    const permissionEmbed = {
      title: "Erreur",
      description: `Tu n'as pas la permission d'effectuer cette commande pour le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
      color: config.errorcolor,
      footer: { text: config.footer },
    };
    return interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
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
