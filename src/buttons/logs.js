const { getlogContainer } = require("../../components/logContainer.js");
const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();

  const [_, type, serv, currentPage, panel] = interaction.customId.split("-");
  const panelId = Number(panel);
  let page = parseInt(currentPage, 10);

  if (type === "prev") {
    page = Math.max(1, page - 1);
  } else if (type === "next") {
    page = page + 1;
  }

  const serverDatas = await getServerDatas(interaction);

  const { error, component: logContainer } = await getlogContainer(
    serverDatas,
    panelId,
    serv,
    page,
  );

  await interaction.message.edit({
    components: [logContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "logs",
};

exports.conf = {
  type: "Button",
};
