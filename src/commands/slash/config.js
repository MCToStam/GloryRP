const { InteractionContextType, MessageFlags } = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers.js");
const { discordStaff } = require("../../../utils/functions/linkedUser.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();

  const serverDatas = await getServerDatas(interaction, serv);
  const configContainer = await getConfigContainer(serverDatas, serv);
  return interaction.reply({
    components: [configContainer],
    flags: MessageFlags.IsComponentsV2,
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
      required: true,
    },
  ],
  contexts: [InteractionContextType.Guild],
  async autocomplete(client, interaction, config) {
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
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
