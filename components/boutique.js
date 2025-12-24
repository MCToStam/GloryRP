const config = require("../config.js");
const { discordLink } = require("../utils/functions/linkedUser");
const { getEmojiTete } = require("../utils/functions/emojis");

function parseEmoji(emoji) {
  if (!emoji) return null;
  const customEmojiMatch = emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);
  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1],
      id: customEmojiMatch[2],
      animated: emoji.startsWith("<a:"),
    };
  }

  return { name: emoji };
}

async function getBoutiqueContainer(guildColor, boutiqueData) {
  const boutiqueOptions = boutiqueData
    .filter((b) => b.enable)
    .map((b) => ({
      label: b.name,
      description: b.description,
      value: `boutique_choix-${guildColor}-${b.id}`,
      emoji: parseEmoji(b.emoji) || undefined,
    }));

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## 🛒 Boutique ${
          guildColor.charAt(0).toUpperCase() + guildColor.slice(1)
        }`,
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 10,
        content: `Bienvenue dans la boutique du serveur **${
          guildColor.charAt(0).toUpperCase() + guildColor.slice(1)
        }**, ici, tu peux commande divers objets qui te seront livré le plus rapidement possible par des membres du rôle-play.`,
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `boutique_choix`,
            placeholder: "Choisis une boutique...",
            options: boutiqueOptions,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueCategorieContainer(
  guildColor,
  boutiqueId,
  categorieId,
  page,
  boutiqueDatas,
) {
  const categorie = boutiqueDatas.categorie.find((c) => c.id === categorieId);

  const categorieOptions = boutiqueDatas.categorie.map((c) => ({
    label: c.nom,
    value: `boutique_choix-${guildColor}-${boutiqueId}-${c.id}`,
    default: c.id === categorieId,
  }));

  const articles = boutiqueDatas.article.filter(
    (a) => a.categorie === categorieId,
  );

  const articlesParPage = 4;
  const totalPages = Math.max(1, Math.ceil(articles.length / articlesParPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * articlesParPage;
  const pagedArticles = articles.slice(start, start + articlesParPage);

  const components = [
    {
      type: 10,
      content: `## 🛒 Boutique ${
        guildColor.charAt(0).toUpperCase() + guildColor.slice(1)
      } - ${boutiqueDatas.name}`,
    },
    { type: 14, spacing: 1 },
  ];

  for (const article of pagedArticles) {
    components.push({
      type: 9,
      components: [
        {
          type: 10,
          content: `### ${article.emoji || "🛍️"} ${
            article.nom
          }\n💰 **Prix :** ${article.prix.toLocaleString()}$/u\n${
            article.quantite !== -1
              ? `🔢 **Quantité restante :** ${article.quantite}`
              : ""
          }`,
        },
      ],
      accessory: {
        type: 2,
        style: 1,
        label: "Ajouter au panier",
        custom_id: `boutique_panier-${guildColor}-${boutiqueId}-${categorieId}-${article.id}-add`,
      },
    });

    components.push({ type: 14, spacing: 1 });
  }

  components.push(
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 2,
          label: "⬅️",
          custom_id: `boutique_choix-${guildColor}-${boutiqueId}-${categorieId}-${
            currentPage - 1
          }`,
          disabled: currentPage <= 1,
        },
        {
          type: 2,
          style: 2,
          label: `Page ${currentPage}/${totalPages}`,
          custom_id: "boutique_status",
          disabled: true,
        },
        {
          type: 2,
          style: 2,
          label: "➡️",
          custom_id: `boutique_choix-${guildColor}-${boutiqueId}-${categorieId}-${
            currentPage + 1
          }`,
          disabled: currentPage >= totalPages,
        },
      ],
    },
    { type: 14, spacing: 1 },
    {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: `boutique_choix`,
          placeholder: "Choisis une catégorie...",
          options: categorieOptions,
        },
      ],
    },
    { type: 14, spacing: 1 },
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 2,
          label: "🚪 Retour",
          custom_id: `boutique_retour-${guildColor}`,
        },
        {
          type: 2,
          style: 1,
          label: "📜 Afficher votre panier",
          custom_id: `boutique_panier_afficher-${guildColor}-${boutiqueId}`,
        },
      ],
    },
  );

  return {
    type: 17,
    accent_color: parseInt(categorie.couleur.replace("#", ""), 16),
    components,
  };
}

async function getPanierContainer(
  guildColor,
  boutiqueId,
  memberId,
  boutiqueDatas,
  client,
) {
  const panier = boutiqueDatas.panier.find((p) => p.memberId === memberId);

  const articlesPanier = panier.article ?? [];

  let totalBrut = 0;
  const detailsArticles = [];

  for (const article of articlesPanier) {
    const articleVrai = boutiqueDatas.article.find((a) => a.id === article.id);
    if (!articleVrai) continue;

    const prixUnitaire = Number(articleVrai.prix);
    const totalArticle = prixUnitaire * article.quantite;

    totalBrut += totalArticle;

    detailsArticles.push({
      id: articleVrai.id,
      categorie: articleVrai.categorie,
      total: totalArticle,
    });
  }

  const now = Math.floor(Date.now() / 1000);

  const reductionsValides = (panier.reduction ?? [])
    .map((id) => boutiqueDatas.reduction.find((r) => r.id === id))
    .filter((r) => r && r.debut <= now && now <= r.fin);

  let totalFinal = totalBrut;

  for (const reduction of reductionsValides) {
    const articlesEligibles = detailsArticles.filter((a) => {
      if (reduction.article?.length && reduction.categorie?.length) {
        return (
          reduction.article.includes(a.id) &&
          reduction.categorie.includes(a.categorie)
        );
      }
      if (reduction.article?.length) {
        return reduction.article.includes(a.id);
      }
      if (reduction.categorie?.length) {
        return reduction.categorie.includes(a.categorie);
      }
      return true;
    });

    const totalEligibles = articlesEligibles.reduce(
      (sum, a) => sum + a.total,
      0,
    );

    if (totalEligibles <= 0) continue;

    if (
      typeof reduction.valeur === "string" &&
      reduction.valeur.endsWith("%")
    ) {
      const pourcentage = parseFloat(reduction.valeur.replace("%", ""));
      const remise = totalEligibles * (pourcentage / 100);
      totalFinal -= remise;
    } else if (
      typeof reduction.valeur === "string" &&
      reduction.valeur.endsWith("$")
    ) {
      const remise = parseFloat(reduction.valeur.replace("$", ""));
      totalFinal -= remise;
    }
  }
  totalFinal = Math.max(0, Math.round(totalFinal));

  const prixAffiche =
    totalFinal < totalBrut
      ? `~~${totalBrut.toLocaleString()}$~~ **${totalFinal.toLocaleString()}$**`
      : `**${totalBrut.toLocaleString()}$**`;

  const components = [
    {
      type: 10,
      content: `## ${await getEmojiTete(
        client,
        panier.pseudo || (await discordLink(memberId)),
      )} Panier ${guildColor.charAt(0).toUpperCase() + guildColor.slice(1)} - ${
        boutiqueDatas.name
      }`,
    },
    { type: 14, spacing: 1 },
  ];

  if (panier.article?.length > 0) {
    for (const article of panier.article) {
      const articleVrai = boutiqueDatas.article.find(
        (a) => a.id === article.id,
      );
      components.push(
        {
          type: 9,
          components: [
            {
              type: 10,
              content: `### ${articleVrai.emoji || "🛍️"} ${article.quantite}x ${
                articleVrai.nom
              }\n💰 **Prix Total :** ${(
                articleVrai.prix * article.quantite
              ).toLocaleString()}$`,
            },
          ],
          accessory: {
            type: 2,
            style: 1,
            label: "Modifier la quantité",
            custom_id: `boutique_panier-${guildColor}-${boutiqueId}-${articleVrai.categorie}-${article.id}-edit`,
          },
        },
        { type: 14, spacing: 1 },
      );
    }
  } else {
    components.push(
      {
        type: 10,
        content: "Aucun article ajouté au panier",
      },
      { type: 14, spacing: 1 },
    );
  }

  if (reductionsValides.length > 0) {
    for (const reductionVrai of reductionsValides) {
      components.push({
        type: 9,
        components: [
          {
            type: 10,
            content: `### ${reductionVrai.code} : ${reductionVrai.valeur}`,
          },
        ],
        accessory: {
          type: 2,
          style: 4,
          label: "Supprimer la réduction",
          custom_id: `boutique_reduction-remove-${guildColor}-${boutiqueId}-${reductionVrai.id}`,
        },
      });
    }
  } else {
    components.push({
      type: 10,
      content: "Aucune réduction ajoutée",
    });
  }

  components.push(
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "➕ Ajouter une réduction",
          custom_id: `boutique_reduction-add-${guildColor}-${boutiqueId}`,
        },
      ],
    },
    { type: 14, spacing: 1 },
  );

  components.push(
    {
      type: 10,
      content: `### 💳 Reste à payer : ${prixAffiche}`,
    },
    { type: 14, spacing: 1 },
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 2,
          label: "🚪 Retour",
          custom_id: `boutique_retour-${guildColor}-${boutiqueId}`,
        },
        {
          type: 2,
          style: 3,
          label: "✅ Valider la commande",
          custom_id: `boutique_commande-valider-${guildColor}-${boutiqueId}`,
          disabled: panier.article?.length === 0,
        },
      ],
    },
  );

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components,
  };
}

module.exports = {
  getBoutiqueContainer,
  getBoutiqueCategorieContainer,
  getPanierContainer,
};
