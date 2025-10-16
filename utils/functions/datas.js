const { MessageFlags } = require('discord.js');
const config = require('../../config.js');
const fs = require('node:fs');

async function getGuildColor(interaction) {
	try {
		const color = interaction.message.components[0].data.accent_color;

		return Object.keys(config.couleur).find((key) => {
			const hexValue = config.couleur[key];
			const decimalValue = typeof hexValue === 'string' ? parseInt(hexValue, 16) : hexValue;
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

async function saveServerDatas(interaction, datas, serveur = null) {
	if (!serveur) {
		serveur = await getGuildColor(interaction);
	}
	const serverPath = `data/servers/${serveur}.json`;
	try {
		fs.writeFileSync(serverPath, JSON.stringify(datas, null, 2));
	} catch (e) {
		console.error(e);
	}
}

module.exports = { getServerDatas, saveServerDatas, getGuildColor };
