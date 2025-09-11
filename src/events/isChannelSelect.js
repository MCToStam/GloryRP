const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const channelSelect = client.container.channelSelects.get(interaction.customId.split('-')[0]);
	const cmdName = interaction.message.interaction ? interaction.message.interaction.commandName : '?';

	if (!channelSelect) return;

	if (interaction.user.id !== interaction.message.interaction.user.id) {
		return interaction.reply({
			content: `❌ **| Vous ne pouvez pas interagir avec ce menus de sélection. Faites \`/${cmdName}\` !**`,
			ephemeral: true,
		});
	}

	try {
		await channelSelect.run(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
