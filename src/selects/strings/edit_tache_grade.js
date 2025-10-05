const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const { getEditTacheContainer } = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");
const fs = require("node:fs");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const new_grade = interaction.values.map(v => v.split('-').pop());
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification des grades autorisés de la tâche ${tache.name}`,
  });

  tache.grade = new_grade;

  const panelPath = `data/servers/${guildColor}.json`;
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas));
  const tacheContainer = await getEditTacheContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    taskId
  );

  await interaction.message.edit({
    components: [tacheContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "edit_tache_grade" };