const { ChannelType, SeparatorSpacingSize, ButtonStyle, MessageFlags } = require('discord.js');
const { getGuildColor, getGuildDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panel = interaction.values[0].split('-')[2];
	var panelName = config.panels[panel].name;
	var panelName = panelName.charAt(0).toUpperCase() + panelName.slice(1);

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
					custom_id: 'toggle-panel-lawyer',
					label: panelState.enable ? 'Activé' : 'Désactivé',
					emoji: { name: panelState.enable ? '✅' : '❌' },
					style: panelState.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 1,
				components: [
					{
						type: 8,
						custom_id: panel + 'channel',
						placeholder: 'Définis un salon',
						max_values: 1,
						channel_types: [ChannelType.GuildText],
					},
				],
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Small,
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

	const components = interaction.message.components.map((row) => row.toJSON());
	await interaction.message.edit({ components: [pannelContainer, configHome] });
};

exports.data = { name: 'config' };
