const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  getPanelContainer,
  getBoutiqueContainer,
} = require("../../../components/containers");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const type = interaction.values[0].split("-")[1];
  const panelId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas =
    type === "panel"
      ? serverDatas.panels.find((x) => x.id === panelId)
      : serverDatas.boutiques.find((x) => x.id === panelId);

  const panelContainer =
    type === "panel"
      ? await getPanelContainer(guildColor, panelDatas, panelId)
      : await getBoutiqueContainer(guildColor, panelDatas, panelId);

  await interaction.message.edit({
    components: [panelContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "config" };
