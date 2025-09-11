const config = require('../config.js');
const { SeparatorSpacingSize, ButtonStyle, time } = require('discord.js');
const { panelsSelecString } = require('./selectsString.js');

async function getconfigContainer(guildDatas, serv) {
	const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
	const lawyerPanel = guildDatas.panels.find((x) => x.id === 'lawyer');
	const journalistPanel = guildDatas.panels.find((x) => x.id === 'journalist');
	const regroupementPanel = guildDatas.panels.find((x) => x.id === 'regroupement');
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
					label: lawyerPanel.enable ? 'Activé' : 'Désactivé',
					emoji: { name: lawyerPanel.enable ? '✅' : '❌' },
					style: lawyerPanel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
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
					label: journalistPanel.enable ? 'Activé' : 'Désactivé',
					emoji: { name: journalistPanel.enable ? '✅' : '❌' },
					style: journalistPanel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 9,
				components: [
					{
						type: 10,
						content: ':busts_in_silhouette: Panel Regroupement',
					},
				],
				accessory: {
					type: 2,
					custom_id: 'toggle-panel-regroupement',
					label: regroupementPanel.enable ? 'Activé' : 'Désactivé',
					emoji: { name: regroupementPanel.enable ? '✅' : '❌' },
					style: regroupementPanel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Small,
			},
			panelsSelecString,
			{
				type: 10,
				content: '-# Dernières modifications : ' + (await time(guildDatas.timestamp, 'R')),
			},
		],
	};
}

module.exports = { getconfigContainer };
