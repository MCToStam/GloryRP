const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { sendEffectif } = require("../../utils/functions/effectif.js");
const { MessageFlags } = require("discord.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const serveur = await getGuildColor(interaction);

  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Envoie de l'effectif",
  });

  await saveServerDatas(interaction, serverDatas, serveur);

  const responseContainer = await sendEffectif(
    client,
    serveur,
    serverDatas,
    panelId,
  );
  return interaction.reply({
    components: [responseContainer],
    allowedMentions: { parse: [] },
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
};

exports.data = {
  name: "send_effectif",
};

exports.conf = {
  type: "User",
};
