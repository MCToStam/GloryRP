const config = require('../../../config.js');
const log = require('../../../utils/modules/logger.js');
const { InteractionContextType, MessageFlags, ButtonStyle, SeparatorSpacingSize } = require('discord.js');
const { getGuildDatas, getGuildPath } = require('../../../utils/functions/datas.js');

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
	const servName = serv.charAt(0).toUpperCase() + serv.slice(1);

	const guildDatas = await getGuildDatas(interaction);
	const lawyerPanelState = guildDatas.panels.find((x) => x.id === 'lawyer');
	const journalistPanelState = guildDatas.panels.find((x) => x.id === 'journalist');

	const configContainer = {
		type: 17,
		accent_color: config.couleur[serv],
		components: [
			{
				type: 10,
				content: '## :gear: Configuration du Role-Play ' + servName,
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Large,
			},
			{
				type: 9,
				components: [
					{
						type: 10,
						content: ':scales: Panel Avocat',
					},
				],
				accessory: {
					type: 2,
					custom_id: 'toggle-panel-lawyer',
					label: lawyerPanelState.enable ? 'Activé' : 'Désactivé',
					emoji: { name: lawyerPanelState.enable ? '✅' : '❌' },
					style: lawyerPanelState.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 9,
				components: [
					{
						type: 10,
						content: ':newspaper: Panel Journaliste',
					},
				],
				accessory: {
					type: 2,
					custom_id: 'toggle-panel-journalist',
					label: journalistPanelState.enable ? 'Activé' : 'Désactivé',
					emoji: { name: journalistPanelState.enable ? '✅' : '❌' },
					style: journalistPanelState.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Small,
			},
			{
				type: 1,
				components: [
					{
						type: 3,
						custom_id: 'config-pannels',
						placeholder: 'Choisis un panel à configurer',
						options: [
							{
								label: 'Panel Avocat',
								value: 'config-panel-lawyer',
								description: "Configure le pannel des tâches avocat (plainte, anti-jeu, cours d'appel etc)",
								emoji: { name: '⚖️' },
							},
							{
								label: 'Panel Journaliste',
								value: 'config-panel-journalist',
								description: 'Configure le pannel des tâches journaliste (vidéo, short, article etc)',
								emoji: { name: '📰' },
							},
						],
					},
				],
			},
		],
	};
	return interaction.reply({ components: [configContainer], flags: MessageFlags.IsComponentsV2 });
};

exports.data = {
	name: 'config',
	description: '⛔ Gestionnaire de commandes slash.',
	options: [
		{
			type: 3,
			name: 'serveur',
			description: 'Serveur que tu souhaites configurer.',
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
