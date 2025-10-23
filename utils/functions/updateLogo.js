const fs = require("fs");
const { getServerDatas } = require("../../utils/functions/datas.js");
require("dotenv").config();

async function updateLogo(client, config) {
  const token = process.env.DISCORD_TOKEN;
  const cache = JSON.parse(fs.readFileSync("./data/logo/serveur.json", "utf8"));
  const guildsToKeep = new Set();

  for (const serveur of config.liste_serveur) {
    try {
      const data = await getServerDatas(false, serveur);
      if (!data?.panels?.length) {
        continue;
      }

      const logoPath = `./data/logo/${serveur}.png`;
      if (!fs.existsSync(logoPath)) {
        continue;
      }

      const imageBase64 =
        "data:image/png;base64," + fs.readFileSync(logoPath).toString("base64");

      const guildIds = new Set();
      for (const panel of data.panels) {
        if (!panel.channels) continue;
        for (const channelId of Object.values(panel.channels)) {
          if (!channelId) continue;
          const channel = await client.channels
            .fetch(channelId)
            .catch(() => null);
          if (channel?.guild) guildIds.add(channel.guild.id);
        }
      }

      for (const guildId of guildIds) {
        guildsToKeep.add(guildId);

        if (cache[guildId] === serveur) {
          continue;
        }

        const res = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${token}`,
              "Content-Type": "application/json",
              "X-Audit-Log-Reason": `Mise à jour automatique du logo ${serveur}`,
            },
            body: JSON.stringify({ avatar: imageBase64 }),
          },
        );

        if (!res.ok) {
          const err = await res.text();
          continue;
        }

        cache[guildId] = serveur;
        fs.writeFileSync(
          "./data/logo/serveur.json",
          JSON.stringify(cache, null, 2),
        );
      }
    } catch (err) {}
  }

  const allGuilds = await client.guilds.fetch();

  for (const [guildId] of allGuilds) {
    if (!guildsToKeep.has(guildId) && cache[guildId]) {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${token}`,
              "Content-Type": "application/json",
              "X-Audit-Log-Reason": "Suppression de l’avatar",
            },
            body: JSON.stringify({ avatar: null }),
          },
        );

        if (!res.ok) {
          const err = await res.text();
          continue;
        }

        delete cache[guildId];
        fs.writeFileSync(
          "./data/logo/serveur.json",
          JSON.stringify(cache, null, 2),
        );
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {}
    }
  }
}

module.exports = { updateLogo };
