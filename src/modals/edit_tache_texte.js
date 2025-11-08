const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { getTacheContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const new_texte = interaction.fields.getTextInputValue("new_texte");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.panel_tache.description = new_texte;
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Édition du texte affiché sur le panel de tâche",
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getTacheContainer(
    panelId,
    guildColor,
    panelDatas,
  );

  return interaction.update({
    components: [goodContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "edit_tache_texte",
};
