const config = require("../config.js");

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
      label: b.name || "Boutique",
      description: b.description || "Pas de description",
      value: `boutique_${b.id}`,
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

module.exports = {
  getBoutiqueContainer,
};
