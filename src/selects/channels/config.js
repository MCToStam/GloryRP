const { MessageFlags, time, userMention } = require('discord.js');
const fs = require('node:fs');
const { getGuildColor, getGuildDatas } = require('../../../utils/functions/datas.js');
const { toTimeStamp } = require('../../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	try {
		await interaction.deferUpdate();
		const channelId = interaction.values[0];
		const panel = interaction.customId.split('-')[1];

		const guildDatas = await getGuildDatas(interaction);
		const panelDatas = guildDatas.panels.find((x) => x.id === panel);

		const channel = interaction.customId.split('-')[3];
		panelDatas.channels[channel] = channelId;

		const modifDate = await toTimeStamp(new Date());
		guildDatas.timestamp = modifDate;
		panelDatas.timestamp = modifDate;
		const guildColor = await getGuildColor(interaction);
		const panelPath = `data/servers/${guildColor}.json`;

		fs.writeFileSync(panelPath, JSON.stringify(guildDatas));
		const components = interaction.message.components.map((row) => row.toJSON());
		for (const row of components) {
			for (const comp of row.components.filter((x) => x.type == 10)) {
				if (comp.content.startsWith('-# Dernières modifications par ')) {
					comp.content =
						'-# Dernières modifications par ' + userMention(panelDatas.lastUser) + ' ' + (await time(panelDatas.timestamp, 'R'));
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

exports.data = { name: 'config' };
