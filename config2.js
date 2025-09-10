const { Partials } = require('discord.js');

const config = {
	owner: '',
	admins: [],

	client: '',
	guild: '',
	bans: [],

	intents: [
		1, //*Guilds
		2, //*GuildMembers
		64, //*GuildInvites
		128, //*GuildVoiceStates
		256, //*GuildPresences
	],
	partials: [Partials.User, Partials.Channel, Partials.GuildMember],
};

module.exports = config;
