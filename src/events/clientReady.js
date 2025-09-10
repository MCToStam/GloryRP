const { ActivityType } = require('discord.js');
const config = require('../../config.js');
const log = require('../../utils/modules/logger.js');
const { getDateTs } = require('../../utils/functions/numbersAndLetters.js');
const { botLaunch } = require('../../index.js');
const checkEmojiCache = require('../../utils/functions/emojis.js');

async function getPlayerCount(server) {
	try {
		var response = await fetch(`${config.glorybot_url}/api/joueurConnecte?serveur=${server}&administrator=true`);
		var response = await response.json();
		if (Array.isArray(response) && response.length > 0 && response[0].nombre !== undefined) {
			return response[0].nombre;
		}
	} catch (error) {}
	return null;
}

async function cycleStatus(client) {
	const server = config.liste_serveur[statusIndex];
	const playerCount = await getPlayerCount(server);

	const statusName =
		playerCount !== null ? `${playerCount} joueurs connectés sur NationsGlory ${server.toUpperCase()}` : `NationsGlory`;

	client.user.setPresence({
		activities: [{ name: statusName, type: ActivityType.Watching }],
		status: 'online',
	});

	statusIndex = (statusIndex + 1) % config.liste_serveur.length;
}

module.exports = async (client, interaction) => {
	const chanCmds = client.channels.cache.get(config.salon.dev.cmd);
	chanCmds.send('**✅ | BOT ON !**');

	const botStart = new Date();
	const latence = (botStart.getTime() - botLaunch[0].getTime()) / 1000;

	const chanStatus = client.channels.cache.get(config.salon.dev.statut);
	const guilds = client.guilds.cache.size;
	const usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

	const readyEmbed = {
		color: config.color,
		title: `:robot: | Robot lancé en ${latence.toFixed(1)}s`,
		description: getDateTs(client.readyAt, 'R'),
	};

	chanStatus.send({ embeds: [readyEmbed] });
	log(`${client.user.username} est pret en ${latence.toFixed(1)}s, sur ${guilds} serveurs et ${usersCount} utilisateurs.`,'READY','green');

	await cycleStatus(client, (statusIndex = 0));

	setInterval(() => cycleStatus(client), 30000);
	//checkEmojiCache(client);
};
