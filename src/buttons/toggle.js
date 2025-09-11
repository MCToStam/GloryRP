const { MessageFlags, ButtonStyle, time } = require('discord.js');
const fs = require('node:fs');
const { getGuildDatas, getGuildColor } = require('../../utils/functions/datas.js');
const { toTimeStamp } = require('../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	const panel = interaction.customId.split('-')[2];
	const realPanelName = config.panels[panel].name;
	const panelName = realPanelName.charAt(0).toUpperCase() + realPanelName.slice(1);
	const components = interaction.message.components.map((row) => row.toJSON());

	const guildDatas = await getGuildDatas(interaction);
	const panelDatas = guildDatas.panels.find((x) => x.id === panel);
	panelDatas.enable = !panelDatas.enable;
	const modifDate = await toTimeStamp(new Date());
	guildDatas.timestamp = modifDate;
	panelDatas.timestamp = modifDate;
	const panelState = panelDatas.enable ? 'activé' : 'désactivé';
	const guildColor = await getGuildColor(interaction);
	const panelPath = `data/servers/${guildColor}.json`;

	try {
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
							subComp.placeholder = panelDatas.enable ? 'Définis un salon' : "Active d'abord le pannel";
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
						}
					}
				} else if (comp.content) {
					if (comp.content.startsWith('-# Dernières modifications : ')) {
						comp.content = '-# Dernières modifications : ' + (await time(panelDatas.timestamp, 'R'));
					}
				} else if (comp.custom_id) {
					if (comp.custom_id.includes('send')) {
						comp.disabled = panelDatas.enable ? false : true;
					}
				}
			}
		}
		await interaction.message.edit({ components });
		interaction.reply({
			content: `:white_check_mark: **| Le pannel ${panelName} a bien été ${panelState} !**`,
			flags: MessageFlags.Ephemeral,
		});
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
