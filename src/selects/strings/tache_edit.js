const { getEditTacheContainer } = require("../../../components/containers");
const {
  getServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const panelId = Number(interaction.values[0].split("-")[1]);
  const tacheId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const tacheContainer = await getEditTacheContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    tacheId,
  );
  return interaction.editReply({
    components: [tacheContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "tache_edit",
};
