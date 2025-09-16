const { getlogContainer } = require("../../components/logContainer.js");
const { getServerDatas } = require("../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();

  const [_, type, serv, currentPage, panel] = interaction.customId.split("-");
  const panelId = Number(panel)
  let page = parseInt(currentPage, 10);

  if (type === "prev") {
    page = Math.max(1, page - 1);
  } else if (type === "next") {
    page = page + 1;
  }

  const serverDatas = await getServerDatas(interaction);

  const logContainer = await getlogContainer(serverDatas, panelId, serv, page);

  await interaction.message.edit({
    components: [logContainer],
    allowedMentions: { parse: [] },
    flags: MessageFlags.IsComponentsV2,
  });
};

exports.data = {
  name: "logs",
};

exports.conf = {
  type: "Button",
};
