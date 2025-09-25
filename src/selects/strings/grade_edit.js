const { getEditGradeContainer } = require("../../../components/containers.js");
const {
  getServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.values[0].split("-")[1]);
  const gradeId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const gradeContainer = await getEditGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    gradeId
  );
  return interaction.update({
    components: [gradeContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "grade_edit",
};