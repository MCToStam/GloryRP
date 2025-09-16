const { getconfigContainer } = require("../../components/containers");
const {
  getGuildColor,
  getServerDatas,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();
  const serverDatas = await getServerDatas(interaction);
  const guildColor = await getGuildColor(interaction);
  const configContainer = await getconfigContainer(serverDatas, guildColor);
  await interaction.message.edit({
    components: [configContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "return",
};

exports.conf = {
  type: "User",
};
