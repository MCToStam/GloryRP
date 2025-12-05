const { getLogContainer } = require("../../components/logContainer.js");
const { getServerDatas } = require("../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();

  const [, action, id, serv, currentPage, typeConfig] =
    interaction.customId.split("-");
  const panelId = Number(id);
  const page = getUpdatedPage(action, Number(currentPage));

  const serverDatas = await getServerDatas(interaction, serv);

  const { component: logContainer } = await getLogContainer(
    serverDatas,
    panelId,
    serv,
    page,
    typeConfig,
  );

  const payload = {
    components: [logContainer],
    allowedMentions: { parse: [] },
  };

  if (action === "first") {
    payload.flags = MessageFlags.IsComponentsV2;
    return interaction.message.reply(payload);
  }

  return interaction.message.edit(payload);
};

function getUpdatedPage(action, currentPage) {
  switch (action) {
    case "first":
      return 1;
    case "prev":
      return Math.max(1, currentPage - 1);
    case "next":
      return currentPage + 1;
    default:
      return currentPage;
  }
}

exports.data = {
  name: "logs",
};
