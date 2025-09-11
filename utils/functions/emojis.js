const fs = require('node:fs');
const path = require('node:path');

async function checkEmojiCache(client) {
	const cachePath = `data/emojisCache.json`;
	let emojisCache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

	try {
		const guild = await client.guilds.fetch('1349379748576366633');
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
					console.warn(`⚠️ Impossible de supprimer l'emoji ${emojiId}:`, e.message);
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

module.exports = checkEmojiCache;
