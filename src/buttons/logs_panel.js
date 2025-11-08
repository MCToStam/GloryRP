const { getlogContainer } = require("../../components/logContainer.js");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction) => {
  await interaction.deferReply();

  const panelId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  const { error, component: logContainer } = await getlogContainer(
    serverDatas,
    panelId,
    guildColor,
    1,
  );
  return interaction.editReply({
    components: [logContainer],
    flags: error
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "show_logs",
};

exports.conf = {
  type: "User",
};
