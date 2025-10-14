const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const { getPanelContainer } = require("../../../components/containers");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const panelId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const panelContainer = await getPanelContainer(guildColor, panelDatas, panelId);

  await interaction.message.edit({
    components: [panelContainer],
    allowedMentions: { parse: [] }
  });
};

exports.data = { name: "config" };
