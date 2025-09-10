const config = require('../../config.js');
const log = require('../../utils/modules/logger.js');
const { botLaunch } = require('../../index.js');

module.exports = async (client, interaction) => {
	//*Logs
	const chanCmds = client.channels.cache.get(chan.cmd.dev);
	chanCmds.send('**✅ | BOT ON !**');

	const botStart = new Date();
	const latence = (botStart.getTime() - botLaunch[0].getTime()) / 1000;

	const chanStatus =
		client.user.id === config.clients[0] ?
			client.channels.cache.get(chan.logs.status)
		:	client.channels.cache.get(chan.logs.statusDev);
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

	//*Présence
	client.user.setPresence({
		status: 'online', //online, idle, offline, dnd
		activities: [
			{
				name: usersCount + ' users',
				type: 5, // PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM, COMPETING
			},
		],
	});
};
