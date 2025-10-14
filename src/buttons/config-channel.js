const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");
const { getChannelContainer } = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();
  const panelId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  
  const channelContainer = await getChannelContainer(panelId, guildColor, panelDatas)

  await interaction.message.edit({
    components: [channelContainer],
    allowedMentions: { parse: [] }
  });
};

exports.data = {
  name: "config_channel",
};

exports.conf = {
  type: "Button",
};