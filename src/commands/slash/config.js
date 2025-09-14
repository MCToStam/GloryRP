const { InteractionContextType, MessageFlags } = require('discord.js');
const { getGuildDatas } = require('../../../utils/functions/datas.js');
const { getconfigContainer } = require('../../../components/containers.js');

exports.run = async (client, interaction, config) => {
	const serv = interaction.options.getString('serveur');
	if (!config.liste_serveur.includes(serv)) {
		const servers =
			config.liste_serveur.slice(0, 2).join(', ') +
			'\n' +
			config.liste_serveur.slice(2, 10).join(', ') +
			'\n' +
			config.liste_serveur.slice(10).join(', ');
		const unknowServerContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: '### :question: Serveur inconnus - "' + serv + '"',
				},
				{
					type: 14,
					spacing: 1,
				},
				{
					type: 10,
					content: 'Tu dois préciser un serveur existant : ' + servers,
				},
			],
		};
		return interaction.reply({ components: [unknowServerContainer], flags: MessageFlags.IsComponentsV2 });
	}

	const guildDatas = await getGuildDatas(interaction);
	const configContainer = await getconfigContainer(guildDatas, serv);
	return interaction.reply({ components: [configContainer], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
};

exports.data = {
	name: 'config',
	description: 'Configure le rôle-play de ton serveur',
	options: [
		{
			type: 3,
			name: 'serveur',
			description: 'Serveur que tu souhaites configurer',
			autocomplete: true,
			required: true,
		},
	],
	contexts: [InteractionContextType.Guild],
	async autocomplete(client, interaction, config) {
		const response = await fetch(config.glorystaff_url + '/api/get-staff?discordId=' + interaction.user.id);
		const servers = await response.json();
		const respondDatas = [];
		for (serv of servers) {
			const servname = serv.charAt(0).toUpperCase() + serv.slice(1);
			respondDatas.push({ name: servname, value: serv });
		}
		await interaction.respond(respondDatas);
	},
};

exports.conf = {
	cooldown: 5,
	enabled: true,
	category: '⚙ Configuration',
};
