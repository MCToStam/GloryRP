const fs = require("node:fs");
const path = require("node:path");
const { AttachmentBuilder } = require("discord.js");

const cachePath = path.join(__dirname, "..", "..", "data", "emojisCache.json");
let emojisCache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
  : {};

async function getEmojiTete(client, joueur) {
  const guild = await client.guilds.fetch("1349379748576366633");
  const key = joueur.toLowerCase();
  const now = Date.now();

  if (emojisCache[key]) {
    const cached = guild.emojis.cache.get(emojisCache[key].emojiId);
    if (cached) return cached;
  }

  const url = `https://skins.nationsglory.fr/face/${joueur}/3d/4`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Impossible de récupérer l'image pour ${joueur}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const attachment = new AttachmentBuilder(buffer, { name: `${key}.png` });

  const emoji = await guild.emojis.create({
    attachment: attachment.attachment,
    name: key.slice(0, 32),
  });

  emojisCache[key] = {
    emojiId: emoji.id,
    nom: joueur,
    createdAt: now,
  };
  fs.writeFileSync(cachePath, JSON.stringify(emojisCache, null, 2));

  return emoji;
}

async function checkEmojiCache(client) {
  const guild = await client.guilds.fetch("1349379748576366633");
  try {
    const now = Date.now();

    for (const [key, { emojiId, createdAt }] of Object.entries(emojisCache)) {
      const emoji = guild.emojis.cache.get(emojiId);

      if (!emoji) {
        delete emojisCache[key];
        continue;
      }

      const age = now - createdAt;
      const oneHour = 60 * 60 * 1000;

      if (age >= oneHour) {
        try {
          await emoji.delete();
          console.log(`🗑️ Emoji ${emoji.name} supprimé (expiré)`);
        } catch (e) {
          console.warn(
            `⚠️ Impossible de supprimer l'emoji ${emojiId}:`,
            e.message
          );
        }
        delete emojisCache[key];
      } else {
        const timeLeft = oneHour - age;
        setTimeout(async () => {
          try {
            const stillHere = guild.emojis.cache.get(emojiId);
            if (stillHere) {
              await stillHere.delete();
              console.log(`🗑️ Emoji ${stillHere.name} supprimé (planifié)`);
            }
            delete emojisCache[key];
            fs.writeFileSync(cachePath, JSON.stringify(emojisCache, null, 2));
          } catch (e) {
            console.warn(`⚠️ Erreur suppression emoji ${emojiId}:`, e.message);
          }
        }, timeLeft);
      }
    }

    fs.writeFileSync(cachePath, JSON.stringify(emojisCache, null, 2));
  } catch (e) {}
}

module.exports = { checkEmojiCache, getEmojiTete };
