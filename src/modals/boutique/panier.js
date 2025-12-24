const {
  getServerDatas,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const { discordLink } = require("../../../utils/functions/linkedUser.js");
const { getPanierContainer } = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);
  const categorieId = Number(interaction.customId.split("-")[3]);
  const articleId = Number(interaction.customId.split("-")[4]);
  const action = interaction.customId.split("-")[5];

  const quantite = Number(interaction.fields.getTextInputValue("quantite"));
  if (!Number.isInteger(quantite) || quantite < 0) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## ❌ Quantité Invalide`,
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: "La quantité doit être un nombre valide.",
        },
      ],
    };

    return interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const article = boutiqueDatas.article.find((a) => a.id === articleId);

  let userPanier = boutiqueDatas.panier.find(
    (u) => u.memberId === interaction.user.id,
  );
  if (!userPanier) {
    userPanier = {
      pseudo: await discordLink(interaction.user.id),
      memberId: interaction.user.id,
      article: [],
      reduction: [],
    };

    boutiqueDatas.panier.push(userPanier);
  }

  const articleIndex = userPanier.article.findIndex((a) => a.id === articleId);

  if (quantite === 0) {
    if (articleIndex !== -1) {
      userPanier.article.splice(articleIndex, 1);
    }
  } else {
    if (articleIndex === -1) {
      userPanier.article.push({ id: articleId, quantite });
    } else {
      userPanier.article[articleIndex].quantite = quantite;
    }
  }

  await saveServerDatas(interaction, serverDatas, guildColor);

  if (action === "add") {
    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        {
          type: 10,
          content: `## ✅ Article Ajouté`,
        },
        {
          type: 14,
          spacing: 1,
        },
        {
          type: 10,
          content: `Tu viens d'ajouter ${quantite}x ${
            article.nom
          } à ton panier pour un total de ${(
            article.prix * quantite
          ).toLocaleString()}$ !`,
        },
      ],
    };

    return interaction.reply({
      components: [goodContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  } else if (action === "edit") {
    const goodContainer = await getPanierContainer(
      guildColor,
      boutiqueId,
      interaction.user.id,
      boutiqueDatas,
      client,
    );

    return interaction.update({
      components: [goodContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "boutique_panier",
};
