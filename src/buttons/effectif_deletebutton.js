const { MessageFlags } = require("discord.js");
const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { getEffectifContainer } = require("../../components/containers.js");
const { updateEffectif } = require("../../utils/functions/effectif.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const buttonLabel = interaction.customId.split("-")[2];

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const button = panelDatas.effectif.button.find(
    (b) => b.label === buttonLabel,
  );

  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Suppression du bouton d'effectif ${button.label}`,
  });

  const buttonIndex = panelDatas.effectif.button.findIndex(
    (b) => b.label === buttonLabel,
  );
  panelDatas.effectif.button.splice(buttonIndex, 1);

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEffectifContainer(
    panelId,
    guildColor,
    panelDatas,
  );
  await interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });

  await updateEffectif(client, guildColor, serverDatas, panelId);
};

exports.data = {
  name: "effectif_deletebutton",
};
