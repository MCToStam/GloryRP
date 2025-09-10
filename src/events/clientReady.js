const { CronJob } = require('cron');
const { GlobalFonts } = require('@napi-rs/canvas');
const config = require('../../config.js');
const log = require('../../utils/modules/logger.js');
const serv = require('../../components/constants/servers.js');
const chan = require('../../components/constants/channels.js');
const { getDateTs } = require('../../utils/functions/numbersAndLetters.js');
const scrapNotas = require('../../utils/scripts/scrap/notations.js');
const scrapDynmap = require('../../utils/scripts/scrap/coords.js');
const scrapCountriesAvailables = require('../../utils/scripts/scrap/countriesAvailables.js');
const checkNotas = require('../../utils/scripts/check/notations.js');
const updateStaff = require('../../utils/scripts/update/staff.js');
const updateNotas = require('../../utils/scripts/update/notations.js');
const updatePillages = require('../../utils/scripts/update/pillages.js');
const updateDisbands = require('../../utils/scripts/update/disbands.js');
const updateMeteorites = require('../../utils/scripts/update/meteorites.js');
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

	//-Définition du fond pour le canvas guildmemberAdd
	GlobalFonts.registerFromPath('./components/fonts/Discord.ttf', 'Discord Medium');
	GlobalFonts.registerFromPath('./components/fonts/OpenSans-ExtraBold.ttf', 'OpenSans-ExtraBold');

	//!Scripts
	if (client.user.id === config.clients[0]) {
		//-Scrapping
		//* Récupère les notas, tous les lundis à 6h30
		new CronJob('00 30 06 * * 1', function () {
			scrapNotas(client, interaction);
		}).start();

		//* Récupère les infos dynmap, tous les jours à 7h
		new CronJob('00 00 07 * * *', function () {
			scrapDynmap(client, interaction);
		}).start();

		//* Récupère les pays disponibles à la création, tous les mercredis/samedis à 17h59
		new CronJob('00 59 17 * * 3,6', function () {
			scrapCountriesAvailables(client, interaction);
		}).start();

		//-Checking
		//* Vérifie si les notas ont été récupérées, tous les jours à 15h
		new CronJob('00 00 15 * * *', function () {
			checkNotas();
		}).start();

		//-Updating
		//* Actualise la liste staff, tous les jours de 18h à 22h
		new CronJob('00 00 18-22 * * *', function () {
			updateStaff(client);
		}).start();

		//* Actualise la liste des notas, tous les lundis à 11h
		new CronJob('00 00 11 * * 1', function () {
			updateNotas(client);
		}).start();

		//* Actualise la liste des pillages, tous les mercredis/samedis à 18h30
		new CronJob('00 00 14 * * 3,6', function () {
			updatePillages(client, interaction);
		}).start();

		//* Actualise la liste des disbands, tous les mercredis/samedis à 18h30
		new CronJob('00 30 18 * * 3,6', function () {
			updateDisbands(client, interaction);
		}).start();

		//* Vérifie qu'une météorite n'a pas spawn toutes les 5minutes
		new CronJob('0 */5 * * * *', function () {
			updateMeteorites(client, interaction);
		}).start();
	}
};
