const config = require("../../config.js");
const fs = require("node:fs");

async function getGuildColor(interaction) {
  if (!interaction?.message?.components?.[0]?.data?.accent_color) return null;

  const color = interaction.message.components[0].data.accent_color;

  return (
    Object.entries(config.couleur).find(([key, hexValue]) => {
      const decimalValue =
        typeof hexValue === "string" ? parseInt(hexValue, 16) : hexValue;
      return decimalValue === color;
    })?.[0] ?? null
  );
}

async function getServerDatas(interaction, serveur = null) {
  if (!serveur) {
    serveur = await getGuildColor(interaction);
    if (!serveur) return null;
  }

  try {
    const rawDatas = fs.readFileSync(`data/servers/${serveur}.json`, "utf-8");
    return JSON.parse(rawDatas);
  } catch (e) {
    return null;
  }
}

async function saveServerDatas(interaction, datas, serveur = null) {
  if (!serveur) {
    serveur = await getGuildColor(interaction);
    if (!serveur) return;
  }

  fs.writeFileSync(
    `data/servers/${serveur}.json`,
    JSON.stringify(datas, null, 2),
  );
}

module.exports = { getServerDatas, saveServerDatas, getGuildColor };
