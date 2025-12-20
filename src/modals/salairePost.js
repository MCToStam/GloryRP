const { salairePost } = require("../../utils/functions/salairePost.js");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const selectedValues = interaction.fields.getStringSelectValues("date");

  const date = selectedValues[0];

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  const container = await salairePost(
    client,
    guildColor,
    serverDatas,
    panelId,
    date,
  );
  return interaction.reply({
    components: [container],
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "salaire_post",
};
