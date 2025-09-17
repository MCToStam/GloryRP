const { getServerDatas, getGuildColor } = require("../../utils/functions/datas.js");
const { sendPanelTasks } = require("../../utils/functions/sendPanel.js");
const { MessageFlags } = require("discord.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");
const fs = require("node:fs");
exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const serveur = await getGuildColor(interaction);

  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Envoie du panel des tâches",
  });

  const panelPath = `data/servers/${serveur}.json`;
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas));

  const responseContainer = await sendPanelTasks(client, serveur, serverDatas, panelId)
  return interaction.reply({ components: [responseContainer], allowedMentions: { parse: [] }, flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
};

exports.data = {
  name: "send",
};

exports.conf = {
  type: "User",
};
