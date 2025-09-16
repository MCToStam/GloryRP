const { getServerDatas, getGuildColor } = require("../../utils/functions/datas.js");
const { sendPanelTasks } = require("../../utils/functions/sendPanel.js");
const { MessageFlags } = require("discord.js");
exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const serveur = await getGuildColor(interaction);

  const responseContainer = await sendPanelTasks(client, serveur, serverDatas, panelId)
  return interaction.reply({ components: [responseContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
};

exports.data = {
  name: "send",
};

exports.conf = {
  type: "User",
};
