const {
  getBoutiqueEditArticleContainer,
} = require("../../../../components/containers");
const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../../utils/functions/datas.js");
const {
  toTimeStamp,
} = require("../../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const articleId1 = Number(interaction.values[0].split("-")[2]);
  const [_, boutiqueIdStr, articleId2, type] = interaction.customId.split("-");
  const articleId = Number(articleId1) || Number(articleId2);
  const boutiqueId = Number(boutiqueIdStr);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutique = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const articleData = boutique.article.find((x) => x.id === articleId);

  if (type) {
    let newValue = interaction.values;
    if (type === "categorie") newValue = newValue[0];
    const modifDate = await toTimeStamp(new Date());

    if (Array.isArray(newValue)) {
      newValue = newValue.map((v) =>
        v.startsWith("article_edit-") ? v.slice(13) : v,
      );
    } else if (typeof newValue === "string") {
      if (newValue.startsWith("article_edit-"))
        newValue = Number(newValue.slice(13));
    }

    const actionLabel =
      type === "grade" ? "du/des grade(s) vendeur(s)" : "de la catégorie";

    serverDatas.logs ??= [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      boutique: boutiqueId,
      action: `Modification ${actionLabel} de l'article ${articleData.nom} de ${articleData[type]} en ${newValue}`,
    });

    articleData[type] = newValue;

    await saveServerDatas(interaction, serverDatas, guildColor);
  }

  const articleContainer = await getBoutiqueEditArticleContainer(
    client,
    guildColor,
    articleData,
    serverDatas,
    boutique,
  );

  return interaction.editReply({
    components: [articleContainer],
    flags: 32768,
    files: articleContainer.files,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "article_edit",
};
