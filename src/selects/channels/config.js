const { MessageFlags, time } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { getGuildColor, getGuildDatas } = require('../../../utils/functions/datas.js');
const { toTimeStamp } = require('../../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	try {
		const channelId = interaction.values[0];
		const panel = interaction.customId.split('-')[2];
		const realPanelName = config.panels[panel].name;
		const panelName = realPanelName.charAt(0).toUpperCase() + realPanelName.slice(1);
		const components = interaction.message.components.map((row) => row.toJSON());

		const guildDatas = await getGuildDatas(interaction);
		const panelDatas = guildDatas.panels.find((x) => x.id === panel);
		panelDatas.channel = channelId;
		const modifDate = await toTimeStamp(new Date());
		guildDatas.timestamp = modifDate;
		panelDatas.timestamp = modifDate;
		const guildColor = await getGuildColor(interaction);
		const panelPath = `data/servers/${guildColor}.json`;

		fs.writeFileSync(panelPath, JSON.stringify(guildDatas));
		for (const row of components) {
			for (const comp of row.components.filter((x) => x.type == 10)) {
				if (comp.content.startsWith('-# Dernières modifications : ')) {
					comp.content = '-# Dernières modifications : ' + (await time(panelDatas.timestamp, 'R'));
				}
			}
		}
		await interaction.message.edit({ components });
		interaction.reply({
			content: `:white_check_mark: **| Le salon du pannel ${panelName} a bien été édité !**`,
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

exports.data = { name: 'config' };
