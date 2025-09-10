const { ChannelType, SeparatorSpacingSize, ButtonStyle, MessageFlags } = require('discord.js');
const { getGuildColor, getGuildDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panel = interaction.values[0].split('-')[2];
	const realPanelName = config.panels[panel].name;
	const panelName = realPanelName.charAt(0).toUpperCase() + realPanelName.slice(1);

	const guildColor = await getGuildColor(interaction);
	const guildDatas = await getGuildDatas(interaction);
	const panelState = guildDatas.panels.find((x) => x.id === panel);

	const pannelContainer = {
		type: 17,
		accent_color: config.couleur[guildColor],
		components: [
			{
				type: 10,
				content: '## :gear: Configuration du Pannel ' + panelName,
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
						content: '📡 Statut',
					},
				],
				accessory: {
					type: 2,
					custom_id: 'toggle-panel-' + panel,
					label: panelState.enable ? 'Activé' : 'Désactivé',
					emoji: { name: panelState.enable ? '✅' : '❌' },
					style: panelState.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Small,
			},
			{
				type: 10,
				content: 'Salon dans lequel est envoyé le pannel des tâches ' + realPanelName + '.',
			},
			{
				type: 1,
				components: [
					{
						type: 8,
						custom_id: 'channel' + panel,
						placeholder: panelState.enable ? 'Définis un salon' : "Active d'abord le pannel",
						max_values: 1,
						disabled: panelState.enable ? false : true,
						channel_types: [ChannelType.GuildText],
					},
				],
			},
		],
	};
	const configHome = {
		type: 1,
		components: [
			{
				type: 2,
				custom_id: 'return-config-home',
				label: 'Accueil',
				emoji: { name: '🏡' },
				style: ButtonStyle.Primary,
			},
		],
	};

	await interaction.message.edit({ components: [pannelContainer, configHome] });
};

exports.data = { name: 'config' };
