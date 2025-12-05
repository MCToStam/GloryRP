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
  getBoutiqueCategorieContainer,
} = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const [, systeme, id, type] = interaction.customId.split("-");
  const panelId = Number(id);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const datas =
    type === "panel"
      ? serverDatas.panels.find((x) => x.id === panelId)
      : serverDatas.boutiques.find((x) => x.id === panelId);

  let container;
  switch (systeme) {
    case "candidature":
      container = await getCandidatureContainer(panelId, guildColor, datas);
      break;
    case "channel":
      container = await getChannelContainer(panelId, guildColor, datas);
      break;
    case "depotdeplainte":
      container = await getDepotDePlainteContainer(panelId, guildColor, datas);
      break;
    case "effectif":
      container = await getEffectifContainer(panelId, guildColor, datas);
      break;
    case "grade":
      container = await getGradeContainer(client, panelId, guildColor, datas);
      break;
    case "panel":
      container = await getEditPanelContainer(panelId, guildColor, datas);
      break;
    case "resumeonu":
      container = await getResumeONUContainer(panelId, guildColor, datas);
      break;
    case "salaire":
      container = await getSalaireContainer(panelId, guildColor, datas);
      break;
    case "tache":
      container = await getTacheContainer(panelId, guildColor, datas);
      break;
    case "categorie":
      container = await getBoutiqueCategorieContainer(
        client,
        panelId,
        guildColor,
        datas,
      );
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
