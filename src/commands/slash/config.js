const {
  InteractionContextType,
  SeparatorSpacingSize,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();

  const serverDatas = await getServerDatas(interaction, serv);
  const configContainer = await getConfigContainer(serverDatas, serv);
  return interaction.reply({
    components: [configContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] }
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
