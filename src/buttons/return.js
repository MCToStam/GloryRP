const {
  getConfigContainer,
  getPanelContainer,
  getGradeContainer,
  getTacheContainer,
  getBoutiqueContainer,
  getBoutiqueArticleContainer,
} = require("../../components/containers");
const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();
  const [action, panel, type, config] = interaction.customId.split("-");
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
    const panelDatas =
      type === "panel"
        ? serverDatas.panels.find((x) => x.id === panelId)
        : serverDatas.boutiques.find((x) => x.id === panelId);

    if (type === "panel") {
      const panelContainer = await getPanelContainer(
        guildColor,
        panelDatas,
        panelId,
      );

      await interaction.message.edit({
        components: [panelContainer],
        allowedMentions: { parse: [] },
      });
    } else {
      const panelContainer = await getBoutiqueContainer(
        guildColor,
        panelDatas,
        panelId,
      );

      await interaction.message.edit({
        components: [panelContainer],
        allowedMentions: { parse: [] },
      });
    }
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
    } else if (config === "article") {
      const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === panelId);
      container = await getBoutiqueArticleContainer(
        panelId,
        guildColor,
        boutiqueDatas,
        1,
      );
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
