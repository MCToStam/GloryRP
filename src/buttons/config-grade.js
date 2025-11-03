const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");
const { getGradeContainer } = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();
  const panelId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const gradeContainer = await getGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
  );

  await interaction.message.edit({
    components: [gradeContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config_grade",
};

exports.conf = {
  type: "User",
};
