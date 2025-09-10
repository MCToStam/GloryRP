const log = require('../../utils/modules/logger.js');

module.exports = async (client, interaction) => {
	const userCmd = client.container.userCmds.get(interaction.commandName);
	if (!userCmd) return;

	try {
		await userCmd.run(client, interaction);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
