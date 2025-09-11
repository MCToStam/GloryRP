const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const btn = client.container.buttons.get(interaction.customId.split('-')[0]);
	const cmdName = interaction.message.interaction ? interaction.message.interaction.commandName : '?';

	if (!btn) return;
	if (btn.conf.type === 'User') {
		if (interaction.user.id !== interaction.message.interaction.user.id) {
			return interaction.reply({
				content: `❌ **| Vous ne pouvez pas interagir avec ce boutton. Faites \`/${cmdName}\` !**`,
				ephemeral: true,
			});
		}
	}

	try {
		await btn.run(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
