const fs = require("fs");
const { getServerDatas } = require("../../utils/functions/datas.js");
require("dotenv").config();

async function updateLogo(client, config) {
  const token = process.env.DISCORD_TOKEN;
  const cachePath = "./data/logo/serveur.json";
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));

  const guildsToKeep = new Set();
  const channelCache = new Map();

  async function patchAvatar(guildId, avatarBase64, reason) {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
          "X-Audit-Log-Reason": reason,
        },
        body: JSON.stringify({ avatar: avatarBase64 }),
      },
    );

    return res.ok;
  }

  for (const serveur of config.liste_serveur) {
    try {
      const data = await getServerDatas(false, serveur);
      if (!data?.panels?.length) continue;

      const logoPath = `./data/logo/${serveur}.png`;
      if (!fs.existsSync(logoPath)) continue;

      const imageBase64 =
        "data:image/png;base64," + fs.readFileSync(logoPath, "base64");

      const guildIds = new Set();

      for (const panel of data.panels) {
        if (!panel.channels) continue;

        for (const channelId of Object.values(panel.channels)) {
          if (!channelId) continue;

          let channel = channelCache.get(channelId);
          if (!channel) {
            channel = await client.channels.fetch(channelId).catch(() => null);
            channelCache.set(channelId, channel);
          }

          if (channel?.guild) guildIds.add(channel.guild.id);
        }
      }

      for (const guildId of guildIds) {
        guildsToKeep.add(guildId);

        if (cache[guildId] === serveur) continue;

        const ok = await patchAvatar(
          guildId,
          imageBase64,
          `Mise à jour automatique du logo ${serveur}`,
        );

        if (ok) {
          cache[guildId] = serveur;
        }
      }
    } catch (e) {}
  }

  const allGuilds = await client.guilds.fetch();

  for (const [guildId] of allGuilds) {
    if (!guildsToKeep.has(guildId) && cache[guildId]) {
      try {
        const ok = await patchAvatar(guildId, null, "Suppression de l’avatar");

        if (ok) {
          delete cache[guildId];
          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (e) {}
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

module.exports = { updateLogo };
