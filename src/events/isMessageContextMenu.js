const log = require('../../utils/modules/logger.js');

module.exports = async (client, interaction) => {
	const msgCmd = client.container.msgCmds.get(interaction.commandName);
	if (!msgCmd) return;

	try {
		await msgCmd.run(client, interaction);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
