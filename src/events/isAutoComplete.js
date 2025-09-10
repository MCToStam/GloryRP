const log = require('../../utils/modules/logger.js');

module.exports = async (client, interaction) => {
	const slashCmd = client.container.slashCmds.get(interaction.commandName);
	if (!slashCmd) return;

	try {
		await slashCmd.data.autocomplete(interaction, client);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
