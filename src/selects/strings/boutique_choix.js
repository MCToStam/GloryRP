const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiqueCategorieContainer,
} = require("../../../components/boutique");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.values[0].split("-")[1];
  const boutiqueId = Number(interaction.values[0].split("-")[2]) || 1;
  const categorieId = Number(interaction.values[0].split("-")[3]) || 1;
  const page = Number(interaction.values[0].split("-")[4]) || 0;

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const boutiqueContainer = await getBoutiqueCategorieContainer(
    guildColor,
    boutiqueId,
    categorieId,
    page,
    boutiqueDatas,
  );

  await interaction.update({
    components: [boutiqueContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "boutique_choix" };
