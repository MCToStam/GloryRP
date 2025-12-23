const { getServerDatas } = require("../../../utils/functions/datas.js");
const {
  getBoutiqueCategorieContainer,
} = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);
  const categorieId = Number(interaction.customId.split("-")[3]);
  const page = Number(interaction.customId.split("-")[4]);

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
