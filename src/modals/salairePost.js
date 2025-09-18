const { salairePost } = require("../../utils/functions/salairePost.js");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { SeparatorSpacingSize, MessageFlags } = require("discord.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  console.log(interaction.fields)

  const date = interaction.fields.getTextInputValue("date");
  console.log(date)

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);

  const container = await salairePost(client, guildColor, serverDatas, panelId, date)
  return interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "salaire_post",
};