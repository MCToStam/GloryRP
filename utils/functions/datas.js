const { MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

async function getGuildPath(interaction) {
	try {
		const rawDatas = fs.readFileSync('data/guilds.json');
		var jsonDatas = await JSON.parse(rawDatas);
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: `:x: **| Une erreur a eu lieu lors de la récupération de vos données !**`,
			flags: MessageFlags.Ephemeral,
		});
	}
	const guildsDatas = await jsonDatas[0].find((x) => x.guild === interaction.guildId);
	return path.join('data/servers/', guildsDatas.server + '.json');
}

async function getGuildDatas(interaction) {
	const serverPath = await getGuildPath(interaction);
	try {
		const rawDatas = fs.readFileSync(serverPath);
		var jsonDatas = await JSON.parse(rawDatas);
		return jsonDatas;
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: `:x: **| Une erreur a eu lieu lors de la récupération de vos données !**`,
			flags: MessageFlags.Ephemeral,
		});
	}
}

module.exports = { getGuildDatas, getGuildPath };
