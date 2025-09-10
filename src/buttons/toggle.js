const { MessageFlags, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const { getGuildDatas, getGuildColor } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panel = interaction.customId.split('-')[2];
	const panelName = panel.charAt(0).toUpperCase() + panel.slice(1);
	const components = interaction.message.components.map((row) => row.toJSON());

	const guildDatas = await getGuildDatas(interaction);
	const panelDatas = guildDatas.panels.find((x) => x.id === panel);
	panelDatas.enable = !panelDatas.enable;
	const panelState = guildDatas.enable ? 'activé' : 'désactivé';
	const guildColor = await getGuildColor(interaction);
	const panelPath = path.join('data/servers/', guildColor + '.json');
	try {
		fs.writeFileSync(panelPath, JSON.stringify(guildDatas));
		for (const row of components) {
			for (const comp of row.components.filter((x) => x.type == 9)) {
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
