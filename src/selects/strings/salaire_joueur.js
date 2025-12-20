const { getServerDatas } = require("../../../utils/functions/datas.js");
const {
  getJoueurSalaireContainer,
} = require("../../../components/salaireContainer.js");

exports.run = async (client, interaction, config) => {
  const joueur = interaction.values[0].split("-")[1];
  const panelId = interaction.customId.split("-")[2];
  const serv = interaction.customId.split("-")[3];

  const serverDatas = await getServerDatas(interaction, serv);
  await interaction.deferUpdate();

  const { component: salaireContainer, attachments } =
    await getJoueurSalaireContainer(serverDatas, panelId, serv, joueur);

  return interaction.editReply({
    components: [salaireContainer],
    files: attachments || [],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "salaire_joueur" };
