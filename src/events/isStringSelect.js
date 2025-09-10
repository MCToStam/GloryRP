const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const selectMenu = client.container.selects.get(interaction.values[0].split('-')[0]);
	const cmdName = interaction.message.interaction ? interaction.message.interaction.commandName : '?';

	if (!selectMenu) return;

	if (interaction.user.id !== interaction.message.interaction.user.id) {
		return interaction.reply({
			content: `❌ **| Vous ne pouvez pas interagir avec ce menus de sélection. Faites \`/${cmdName}\` !**`,
			ephemeral: true,
		});
	}

	try {
		await selectMenu.run(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
