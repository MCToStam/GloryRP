const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { sendPanelTasks } = require("../../utils/functions/sendPanel.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serveur = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, serveur);

  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Envoie du panel des tâches",
  });

  await saveServerDatas(interaction, serverDatas, serveur);

  const responseContainer = await sendPanelTasks(
    client,
    serveur,
    serverDatas,
    panelId,
  );
  return interaction.reply({
    components: [responseContainer],
    allowedMentions: { parse: [] },
    flags: 32768 | 64,
  });
};

exports.data = {
  name: "send_panel",
};
