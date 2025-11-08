const {
  getConfigContainer,
  getPanelContainer,
  getGradeContainer,
  getTacheContainer,
} = require("../../components/containers");
const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();
  const [action, panel, config] = interaction.customId.split("-");
  const panelId = Number(panel);

  if (action === "return" && !panelId && !config) {
    const guildColor = await getGuildColor(interaction);
    const serverDatas = await getServerDatas(interaction, guildColor);
    const configContainer = await getConfigContainer(serverDatas, guildColor);

    await interaction.message.edit({
      components: [configContainer],
      allowedMentions: { parse: [] },
    });
  } else if (action === "return" && panelId && !config) {
    const guildColor = await getGuildColor(interaction);
    const serverDatas = await getServerDatas(interaction, guildColor);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    const panelContainer = await getPanelContainer(
      guildColor,
      panelDatas,
      panelId,
    );

    await interaction.message.edit({
      components: [panelContainer],
      allowedMentions: { parse: [] },
    });
  } else if (action === "return" && panelId && config) {
    const guildColor = await getGuildColor(interaction);
    const serverDatas = await getServerDatas(interaction, guildColor);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    let container;
    if (config === "grade") {
      container = await getGradeContainer(
        client,
        panelId,
        guildColor,
        panelDatas,
      );
    } else if (config === "tache") {
      container = await getTacheContainer(panelId, guildColor, panelDatas);
    }

    await interaction.message.edit({
      components: [container],
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "return",
};

exports.conf = {
  type: "User",
};
