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

  if (panier) {
    for (const article of panier.article) {
      const articleVrai = boutiqueDatas.article.find(
        (a) => a.id === article.id,
      );
      components.push({
        type: 9,
        components: [
          {
            type: 10,
            content: `### ${article.emoji || "🛍️"} ${article.quantite}x ${
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
      });

      components.push({ type: 14, spacing: 1 });
    }
  } else {
    components.push({
      type: 10,
      content: "Aucun article ajouté au panier",
    });
  }

  components.push({
    type: 1,
    components: [
      {
        type: 2,
        style: 2,
        label: "🚪 Retour",
        custom_id: `boutique_retour-${guildColor}-${boutiqueId}`,
      },
    ],
  });

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
