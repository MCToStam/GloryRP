const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");
const {
  getConfigContainer,
  getPanelContainer,
} = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const panelId = Number(interaction.customId.split("-")[2]);
  const menu = interaction.customId.split("-")[3];

  const guildColor = await getGuildColor(interaction);
  let serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const modifDate = await toTimeStamp(new Date());

  panelDatas.enable = !panelDatas.enable;
  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;
  panelDatas.timestamp = modifDate;
  panelDatas.lastUser = interaction.user.id;

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: panelDatas.enable
      ? "Activation du module"
      : "Désactivation du module",
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  serverDatas = await getServerDatas(interaction, guildColor);
  const updatedPanelDatas = serverDatas.panels.find((x) => x.id === panelId);

  let components;
  if (menu === "acceuil") {
    components = await getConfigContainer(serverDatas, guildColor);
  } else if (menu === "panel") {
    components = await getPanelContainer(
      guildColor,
      updatedPanelDatas,
      panelId,
    );
  }

  return await interaction.message.edit({
    components: [components],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "toggle",
};

exports.conf = {
  type: "User",
};
