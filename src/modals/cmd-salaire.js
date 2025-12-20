const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const cmdRetrait = interaction.fields.getTextInputValue("money_take");
  const cmdDon = interaction.fields.getTextInputValue("money_give");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.salaire.cmd_retrait = cmdRetrait;
  panelDatas.salaire.cmd_don = cmdDon;
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Édition des commandes de salaire",
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
      {
        type: 10,
        content: "## :white_check_mark: Commandes Modifiées",
      },
      {
        type: 14,
        spacing: 2,
      },
      {
        type: 10,
        content: `Les commandes permettant de retirer l'argent total et celle qui donne l'argent à un joueur ont correctement été modifiées :\n> \`\`${cmdRetrait}\`\`\n> \`\`${cmdDon}\`\`\n\nPour rappel, \`\`[somme]\`\` sera remplacé par l'argent à donner et \`\`[joueur]\`\` par le pseudonyme du joueur à qui donner l'argent.`,
      },
    ],
  };
  return interaction.reply({
    components: [goodContainer],
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config_salaire",
};
