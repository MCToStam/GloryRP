const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const slashCmd = client.container.slashCmds.get(interaction.commandName);
	if (!slashCmd) return;

	try {
		await slashCmd.data.autocomplete(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
