const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");
const {
  getTacheContainer,
  getChannelContainer,
  getSalaireContainer,
  getEditPanelContainer,
  getGradeContainer,
  getEffectifContainer,
  getResumeONUContainer,
  getCandidatureContainer,
  getDepotDePlainteContainer,
} = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const [, type, id] = interaction.customId.split("-");
  const panelId = Number(id);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  let container;
  switch (type) {
    case "candidature":
      container = await getCandidatureContainer(
        panelId,
        guildColor,
        panelDatas,
      );
      break;
    case "channel":
      container = await getChannelContainer(panelId, guildColor, panelDatas);
      break;
    case "depotdeplainte":
      container = await getDepotDePlainteContainer(
        panelId,
        guildColor,
        panelDatas,
      );
      break;
    case "effectif":
      container = await getEffectifContainer(panelId, guildColor, panelDatas);
      break;
    case "grade":
      container = await getGradeContainer(
        client,
        panelId,
        guildColor,
        panelDatas,
      );
      break;
    case "panel":
      container = await getEditPanelContainer(panelId, guildColor, panelDatas);
      break;
    case "resumeonu":
      container = await getResumeONUContainer(panelId, guildColor, panelDatas);
      break;
    case "salaire":
      container = await getSalaireContainer(panelId, guildColor, panelDatas);
      break;
    case "tache":
      container = await getTacheContainer(panelId, guildColor, panelDatas);
      break;
  }

  await interaction.message.edit({
    components: [container],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config",
};
