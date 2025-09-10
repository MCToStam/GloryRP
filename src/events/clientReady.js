const config = require('../../config2.js');
const log = require('../../utils/modules/logger.js');
const serv = require('../../components/constants/servers.js');
const chan = require('../../components/constants/channels.js');
const { getDateTs } = require('../../utils/functions/numbersAndLetters.js');
const { botLaunch } = require('../../index.js');
const checkEmojiCache = require('../../utils/functions/emojis.js');

async function getPlayerCount(server) {
	try {
		const response = await axios.get(`${config.glorybot_url}/api/joueurConnecte?serveur=${server}&administrator=true`);
		if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].nombre !== undefined) {
			return response.data[0].nombre;
		}
	} catch (error) {}
	return null;
}

async function cycleStatus() {
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
	//*Logs
	const chanCmds = client.channels.cache.get(chan.cmd.dev);
	chanCmds.send('**✅ | BOT ON !**');

	const botStart = new Date();
	const latence = (botStart.getTime() - botLaunch[0].getTime()) / 1000;

	const chanStatus =
		client.user.id === config.clients[0]
			? client.channels.cache.get(chan.logs.status)
			: client.channels.cache.get(chan.logs.statusDev);
	const guilds = client.guilds.cache.size;
	const usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

	const readyEmbed = {
		color: serv.assets.blue.color,
		title: `:robot: | Robot lancé en ${latence.toFixed(1)}s`,
		description: getDateTs(client.readyAt, 'R'),
	};

	chanStatus.send({ embeds: [readyEmbed] });
	log(
		`${client.user.username} is ready in ${latence.toFixed(1)}s to serve ${usersCount} users, ${guilds} guilds.`,
		'READY',
		'green'
	);

	let statusIndex = 0;

	await cycleStatus();
	setInterval(cycleStatus, 30000);
	//checkEmojiCache(client);
};
