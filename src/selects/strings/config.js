const { ChannelType, SeparatorSpacingSize, ButtonStyle, MessageFlags, time, userMention } = require('discord.js');
const { getGuildColor, getGuildDatas } = require('../../../utils/functions/datas.js');
const { getDateTs } = require('../../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	const panel = interaction.values[0].split('-')[2];
	const realPanelName = config.panels[panel].name;
	const panelName = realPanelName.charAt(0).toUpperCase() + realPanelName.slice(1);

	const guildColor = await getGuildColor(interaction);
	const guildDatas = await getGuildDatas(interaction);
	const panelDatas = guildDatas.panels.find((x) => x.id === panel);
	const panelContainer = {
		type: 17,
		accent_color: config.couleur[guildColor],
		components: [
			{
				type: 10,
				content: '## :gear: Configuration du Panel ' + panelName,
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
					label: panelDatas.enable ? 'Activé' : 'Désactivé',
					emoji: { name: panelDatas.enable ? '✅' : '❌' },
					style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
				},
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Small,
			},
			{
				type: 10,
				content: 'Salon dans lequel est envoyé le panel des tâches ' + realPanelName + '.',
			},
			{
				type: 1,
				components: [
					{
						type: 8,
						custom_id: 'config-channel-' + panel,
						placeholder: panelDatas.enable ? 'Définis un salon' : "Active d'abord le panel",
						max_values: 1,
						disabled: panelDatas.enable ? false : true,
						channel_types: [ChannelType.GuildText],
						default_values:
							panelDatas.enable && panelDatas.channel ?
								[
									{
										type: 'channel',
										id: panelDatas.channel,
									},
								]
							:	null,
					},
				],
			},
			{
				type: 10,
				content: '-# Dernières modifications par ' + userMention(panelDatas.lastUser) + ' ' + (await time(panelDatas.timestamp, 'R')),
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
			panelDatas.channel ?
				{
					type: 2,
					custom_id: 'send-panel-' + panel,
					label: 'Envoyer',
					emoji: { name: '📨' },
					style: ButtonStyle.Secondary,
					disabled: panelDatas.enable ? false : true,
				}
			:	null,
		],
	};

	await interaction.message.edit({ components: [panelContainer, configHome] });
	return interaction.reply({
		content: ':gear: **| Configure le panel ' + panelName + ' !**',
		flags: MessageFlags.Ephemeral,
	});
};

exports.data = { name: 'config' };
