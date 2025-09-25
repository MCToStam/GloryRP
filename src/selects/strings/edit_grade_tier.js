const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const { getEditGradeContainer } = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");
const fs = require("node:fs");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const new_tier = interaction.values[0].split("-")[1];
  const panelId = Number(interaction.customId.split("-")[1]);
  const gradeId = Number(interaction.customId.split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification du tier du grade ${grade.nom} de ${grade.tier} en ${new_tier}`,
  });

  grade.tier = new_tier;

  const panelPath = `data/servers/${guildColor}.json`;
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas));
  const salaireContainer = await getEditGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    gradeId
  );

  await interaction.message.edit({
    components: [salaireContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "edit_grade_tier" };
