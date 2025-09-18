const fs = require("fs");
const path = require("path");
const { getServerDatas, getGuildColor } = require("../../utils/functions/datas.js");
const { SeparatorSpacingSize, MessageFlags } = require('discord.js');

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const cmdRetrait = interaction.fields.getTextInputValue("money_take");
  const cmdDon = interaction.fields.getTextInputValue("money_give");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.salaire.cmd_retrait = cmdRetrait;
  panelDatas.salaire.cmd_don = cmdDon;

  const panelPath = path.join(__dirname, `../../data/servers/${guildColor}.json`);
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2), "utf8");

const goodContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
        {
            type: 10,
            content: '## :white_check_mark: Commandes Modifiées ',
        },
        {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
        },
        {
            type: 10,
            content: `Les commandes permettant de retirer l'argent total et celle qui donne l'argent à un joueur ont correctement été modifiées :\n> \`\`${cmdRetrait}\`\`\n> \`\`${cmdDon}\`\`\n\nPour rappel, \`\`[somme]\`\` sera remplacé par l'argent à donner et \`\`[joueur]\`\` par le pseudonyme du joueur à qui donner l'argent.`,
        },
    ],
};
return interaction.reply({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] }
});
};

exports.data = { 
  name: "config_salaire" 
};
