const { getConfigContainer, getPanelContainer, getGradeContainer } = require("../../components/containers");
const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();
  const [action, panel, config] = interaction.customId.split("-");
  const panelId = Number(panel)

  if (action === "return" && !panelId && !config) {
    const serverDatas = await getServerDatas(interaction);
    const guildColor = await getGuildColor(interaction);
    const configContainer = await getConfigContainer(serverDatas, guildColor);

    await interaction.message.edit({
      components: [configContainer],
      allowedMentions: { parse: [] }
    });
  } else if (action === "return" && panelId && !config) {
    const guildColor = await getGuildColor(interaction);
    const serverDatas = await getServerDatas(interaction);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    const panelContainer = await getPanelContainer(guildColor, panelDatas, panelId);

    await interaction.message.edit({
      components: [panelContainer],
      allowedMentions: { parse: [] }
    });
  } else if (action === "return" && panelId && config) {
    const guildColor = await getGuildColor(interaction);
    const serverDatas = await getServerDatas(interaction);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    let container
    if (config === "grade") {
      container = await getGradeContainer(client, panelId, guildColor, panelDatas);
    }

    await interaction.message.edit({
      components: [container],
      allowedMentions: { parse: [] }
    });
  }
};

exports.data = {
  name: "return",
};

exports.conf = {
  type: "User",
};
