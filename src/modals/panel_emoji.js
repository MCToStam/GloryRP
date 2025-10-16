const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");
const { getEditPanelContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const new_emoji = interaction.fields.getTextInputValue("new_emoji") || false;

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.emoji = new_emoji;
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Édition de l'émoji du rôle-play",
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEditPanelContainer(
    panelId,
    guildColor,
    panelDatas,
  );
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "panel_emoji",
};
