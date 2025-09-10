const config = require('../config.js');
const { SeparatorSpacingSize, ButtonStyle } = require('discord.js');
const { panelsSelecString } = require('./selectsString.js');

function getconfigContainer(guildDatas, serv) {
	const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
	const lawyerPanelState = guildDatas.panels.find((x) => x.id === 'lawyer');
	const journalistPanelState = guildDatas.panels.find((x) => x.id === 'journalist');
	return {
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
			panelsSelecString,
		],
	};
}

module.exports = { getconfigContainer };
