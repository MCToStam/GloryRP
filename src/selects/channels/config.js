const {
  getChannelContainer,
  getCandidatureContainer,
  getSalaireContainer,
  getDepotDePlainteContainer,
  getEffectifContainer,
} = require("../../../components/containers");
const {
  getGuildColor,
  saveServerDatas,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const parts = interaction.customId.split("-");
  const panelId = Number(parts[1]);
  const channel = parts[3];
  const typeReturn = parts[4];

  const channelId =
    interaction.values.length === 0 ? false : interaction.values[0];

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const modifDate = await toTimeStamp(new Date());
  serverDatas.timestamp = modifDate;
  panelDatas.timestamp = modifDate;

  const logMap = {
    logs: "Édition du salon des logs",
    cmd_salaire: "Édition du salon des commandes de salaire",
    responsable: "Édition du salon de responsable",
    tasks: "Édition du salon des tâches",
    salaire: "Édition du salon de salaire",
    effectif: "Édition du salon d'effectif",
    candidature: "Édition du salon de candidature",
  };

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: logMap[channel] || "Édition d’un salon inconnu",
  });

  if (!panelDatas.channels) panelDatas.channels = {};
  panelDatas.channels[channel] = channelId;

  await saveServerDatas(interaction, serverDatas, guildColor);

  let container;
  if (typeReturn === "candidature") {
    container = await getCandidatureContainer(panelId, guildColor, panelDatas);
  } else if (typeReturn === "salaire") {
    container = await getSalaireContainer(panelId, guildColor, panelDatas);
  } else if (typeReturn === "effectif") {
    container = await getEffectifContainer(panelId, guildColor, panelDatas);
  } else if (typeReturn === "depotdeplainte") {
    container = await getDepotDePlainteContainer(
      panelId,
      guildColor,
      panelDatas,
    );
  } else if (typeReturn === "candidature") {
    container = await getCandidatureContainer(panelId, guildColor, panelDatas);
  } else {
    container = await getChannelContainer(panelId, guildColor, panelDatas);
  }

  await interaction.message.edit({
    components: [container],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "config" };
