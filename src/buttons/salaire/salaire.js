const { getServerDatas } = require("../../../utils/functions/datas.js");
const {
  getSalaireContainer,
} = require("../../../components/salaireContainer.js");

exports.run = async (client, interaction, config) => {
  const [_, date, panelId, serv] = interaction.customId.split("-");
  const serverDatas = await getServerDatas(interaction, serv);

  const { error, component: salaireContainer } = await getSalaireContainer(
    client,
    serverDatas,
    panelId,
    serv,
    date,
  );
  return interaction.update({
    components: [salaireContainer],
    flags: error ? 32768 | 64 : 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "salaire",
};
