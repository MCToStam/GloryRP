if (Number(process.version.slice(1).split('.')[0]) < 19)
	throw new Error('Node 19.x est requis. Veuillez augmenter la version de Node.');
require('dotenv').config({ quiet: true });

const { Client, Collection, IntentsBitField } = require('discord.js');
const { readdirSync } = require('fs');
const { intents, partials } = require('./config.js');
const log = require('./utils/modules/logger.js');
const botLaunch = [];
const myIntents = new IntentsBitField();
myIntents.add(intents);
const client = new Client({ intents: myIntents, partials: partials });

const slashCmds = new Collection();
client.cooldowns = new Collection();
const userCmds = new Collection();
const msgCmds = new Collection();
const buttons = new Collection();
const selects = new Collection();
const modals = new Collection();

client.container = {
	slashCmds,
	userCmds,
	msgCmds,
	buttons,
	selects,
	modals,
};

const init = async () => {
	async function load(type, path, typeLog) {
		const files = readdirSync(path).filter((file) => file.endsWith('.js'));

		for (const file of files) {
			const command = require(`${path}/${file}`);
			const commandName = file.split('.')[0];
			log(`Chargement ${typeLog}: ${commandName}. 👌`, 'LOG', 'gray');
			client.container[type].set(command.data.name, command);
		}
	}

	botLaunch.push(new Date());
	await load('slashCmds', './src/commands/slash', 'Slash Command');
	await load('userCmds', './src/commands/user', 'User Command');
	await load('msgCmds', './src/commands/message', 'Message Command');
	await load('buttons', './src/buttons', 'Button');
	await load('selects', './src/selects', 'Select');
	await load('modals', './src/modals', 'Modals');

	const eventFiles = readdirSync('./src/events/').filter((file) => file.endsWith('.js'));

	for (const file of eventFiles) {
		const eventName = file.split('.')[0];
		log(`Chargement Event: ${eventName}. 👌`, 'LOG', 'gray');
		const event = require(`./src/events/${file}`);
		client.on(eventName, event.bind(null, client));
	}

	client.login(); /*.then(async () => {
		const config = require('./config.js');
		const guild = client.guilds.cache.get(config.guild);
		const guildCmds = guild.commands;
		const cmd = client.container.slashCmds;
		const cmdSlashs = cmd.filter((c) => c.data.name === 'cmd');
		await guildCmds.set(cmdSlashs.map((c) => c.data)).catch((e) => console.log(e));
	});*/
	log(`Node ${process.version} !`, 'READY', 'green');
};

init();
module.exports = { botLaunch };
