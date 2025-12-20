const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");
const {
  getConfigContainer,
  getPanelContainer,
  getBoutiqueContainer,
} = require("../../components/containers");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const type = interaction.customId.split("-")[1];
  const itemId = Number(interaction.customId.split("-")[2]);
  const menu = interaction.customId.split("-")[3];

  const guildColor = await getGuildColor(interaction);
  let serverDatas = await getServerDatas(interaction, guildColor);

  const datasArray =
    type === "panel" ? serverDatas.panels : serverDatas.boutiques;

  const itemDatas = datasArray.find((x) => x.id === itemId);
  if (!itemDatas) return;

  const modifDate = await toTimeStamp(new Date());

  itemDatas.enable = !itemDatas.enable;
  itemDatas.timestamp = modifDate;
  itemDatas.lastUser = interaction.user.id;

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    [type]: itemId,
    action: itemDatas.enable
      ? "Activation du module"
      : "Désactivation du module",
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  serverDatas = await getServerDatas(interaction, guildColor);

  const updatedItemDatas =
    type === "panel"
      ? serverDatas.panels.find((x) => x.id === itemId)
      : serverDatas.boutiques.find((x) => x.id === itemId);

  let components;
  if (menu === "acceuil") {
    components = await getConfigContainer(serverDatas, guildColor);
  } else if (menu === "panel") {
    components = await getPanelContainer(guildColor, updatedItemDatas, itemId);
  } else if (menu === "boutique") {
    components = await getBoutiqueContainer(
      guildColor,
      updatedItemDatas,
      itemId,
    );
  }

  return interaction.message.edit({
    components: [components],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "toggle",
};
