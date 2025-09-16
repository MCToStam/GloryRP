const { MessageFlags } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

async function getGuildColor(interaction) {
  try {
    const rawDatas = fs.readFileSync("data/guilds.json");
    const jsonDatas = await JSON.parse(rawDatas);
    const guildsDatas = await jsonDatas[0].find(
      (x) => x.guild === interaction.guild.id
    );
    return guildsDatas.server;
  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de la récupération de vos données !**`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function getServerDatas(interaction) {
  const guildColor = await getGuildColor(interaction);
  const serverPath = `data/servers/${guildColor}.json`;
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
