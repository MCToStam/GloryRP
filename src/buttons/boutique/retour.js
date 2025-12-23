const { getServerDatas } = require("../../../utils/functions/datas.js");
const {
  getBoutiqueContainer,
  getBoutiqueCategorieContainer,
} = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  try {
    const guildColor = interaction.customId.split("-")[1];
    const boutiqueId = Number(interaction.customId.split("-")[2]);
    const categorieId = Number(interaction.customId.split("-")[3]) || 1;
    const page = Number(interaction.customId.split("-")[4]) || 0;

    const serverDatas = await getServerDatas(interaction, guildColor);
    const boutiqueDatas = serverDatas.boutiques.find(
      (x) => x.id === boutiqueId,
    );

    let container;
    if (!boutiqueId) {
      container = await getBoutiqueContainer(guildColor, serverDatas.boutiques);
    } else {
      container = await getBoutiqueCategorieContainer(
        guildColor,
        boutiqueId,
        categorieId,
        page,
        boutiqueDatas,
      );
    }

    await interaction.update({
      components: [container],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.data = { name: "boutique_retour" };
