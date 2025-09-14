const { MessageFlags, ButtonStyle, time, userMention } = require('discord.js');
const fs = require('node:fs');
const { getGuildDatas, getGuildColor } = require('../../utils/functions/datas.js');
const { toTimeStamp } = require('../../utils/functions/numbersAndLetters.js');
const { getPanelsSelecString } = require('../../components/selectsString.js');

exports.run = async (client, interaction, config) => {
	try {
		await interaction.deferUpdate();
		const panel = interaction.customId.split('-')[2];
		const components = interaction.message.components.map((row) => row.toJSON());

		const guildDatas = await getGuildDatas(interaction);
		const panelDatas = guildDatas.panels.find((x) => x.id === panel);

		const guildColor = await getGuildColor(interaction);
		const panelPath = `data/servers/${guildColor}.json`;
		const modifDate = await toTimeStamp(new Date());

		panelDatas.enable = !panelDatas.enable;
		guildDatas.timestamp = modifDate;
		guildDatas.lastUser = interaction.user.id;
		panelDatas.timestamp = modifDate;
		panelDatas.lastUser = interaction.user.id;

		if (!guildDatas.logs) guildDatas.logs = [];
			guildDatas.logs.push({
			user: interaction.user.id,
			timestamp: modifDate,
			panel: panel,
			action: panelDatas.enable ? 'Activation du module' : 'Désactivation du module'
		});

		fs.writeFileSync(panelPath, JSON.stringify(guildDatas));
		for (const row of components) {
			for (const comp of row.components) {
				if (comp.accessory) {
					if (comp.accessory.custom_id === interaction.customId) {
						if (panelDatas.enable) {
							comp.accessory.label = 'Activé';
							comp.accessory.emoji = { name: '✅' };
							comp.accessory.style = ButtonStyle.Success;
						} else {
							comp.accessory.label = 'Désactivé';
							comp.accessory.emoji = { name: '❌' };
							comp.accessory.style = ButtonStyle.Danger;
						}
					}
				} else if (comp.components) {
					for (const subComp of comp.components) {
						if (subComp.custom_id.includes('channel')) {
							subComp.placeholder = panelDatas.enable ? 'Définis un salon' : "Active d'abord le panel";
							subComp.disabled = panelDatas.enable ? false : true;
							subComp.default_values =
								panelDatas.enable && panelDatas.channel ?
									[
										{
											type: 'channel',
											id: panelDatas.channel,
										},
									]
								:	null;
						} else if (subComp.custom_id.includes('config-panels')) {
							const newsubComp = await getPanelsSelecString(guildDatas);
							subComp.placeholder = newsubComp.placeholder;
							subComp.options = newsubComp.options;
							subComp.disabled = newsubComp.disabled;
						}
					}
				} else if (comp.content) {
					if (comp.content.startsWith('-# Dernières modifications par ')) {
						comp.content =
							'-# Dernières modifications par ' + userMention(panelDatas.lastUser) + ' ' + (await time(panelDatas.timestamp, 'R'));
					}
				} else if (comp.custom_id) {
					if (comp.custom_id.includes('send')) {
						comp.disabled = panelDatas.enable ? false : true;
					}
				}
			}
		}
		await interaction.message.edit({ components: components, allowedMentions: { parse: [] } });
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: `:x: **| Une erreur a eu lieu lors de l'écriture de vos données !**`,
			flags: MessageFlags.Ephemeral,
		});
	}
};

exports.data = {
	name: 'toggle',
};

exports.conf = {
	type: 'User',
};
