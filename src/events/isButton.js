const { SeparatorSpacingSize, MessageFlags } = require('discord.js');
const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const btn = client.container.buttons.get(interaction.customId.split('-')[0]);
	const cmdName = interaction.message.interaction ? interaction.message.interaction.commandName : '?';

	if (!btn) return;
	if (btn.conf.type === 'User') {
		if (interaction.user.id !== interaction.message.interaction.user.id) {
			const permissionContainer = {
				type: 17,
				accent_color: config.colors.error,
				components: [
					{
						type: 10,
						content: '## :no_entry_sign: Intéraction Interdite ',
					},
					{
						type: 14,
						spacing: SeparatorSpacingSize.Large,
					},
					{
						type: 10,
						content: "Vous n'avez pas la permission d'intéragir avec ce bouton car vous n'êtes pas l'auteur de la commande.",
					},
				],
			};
			return interaction.reply({ components: [permissionContainer], flags: MessageFlags.IsComponentsV2 });
		}
	}

	try {
		await btn.run(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
