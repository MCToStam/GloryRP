const { MessageFlags } = require("discord.js");
const config = require("../../config.js");
const fs = require("node:fs");
const path = require("node:path");

async function getGuildColor(interaction) {
  try {
    const color = interaction.message.components[0].data.accent_color;

    return serveur = Object.keys(config.couleur).find((key) => {
      const hexValue = config.couleur[key];
      const decimalValue =
        typeof hexValue === "string" ? parseInt(hexValue, 16) : hexValue;
      return decimalValue === color;
    });
  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de la récupération de vos données !**`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function getServerDatas(interaction, serveur = null) {
  if (!serveur) {
    serveur = await getGuildColor(interaction);
  }
  const serverPath = `data/servers/${serveur}.json`;
  try {
    const rawDatas = fs.readFileSync(serverPath);
    const jsonDatas = await JSON.parse(rawDatas);
    return jsonDatas;
  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de la récupération de vos données !**`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { getServerDatas, getGuildColor };
