const { SeparatorSpacingSize, MessageFlags } = require('discord.js');
const log = require('../../utils/modules/logger.js');
const config = require('../../config.js');

module.exports = async (client, interaction) => {
	const stringSelect = client.container.stringSelects.get(interaction.values[0].split('-')[0]);
	const cmdName = interaction.message.interaction ? interaction.message.interaction.commandName : '?';

	if (!stringSelect) return;
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
					content: "Vous n'avez pas la permission d'intéragir avec ce sélectionneur car vous n'êtes pas l'auteur de la commande.",
				},
			],
		};
		return interaction.reply({ components: [permissionContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
	}

	try {
		await stringSelect.run(client, interaction, config);
	} catch (e) {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: '## :x: Une erreur est survenue',
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: "Une erreur est survenue lors de l'exécution de cette intéraction. Si le problème se reproduit, il est important de le signaler sur le [serveur support](https://discord.gg/tFkb9nYSd8).",
				},
			],
		};

		if (interaction.deferred || interaction.replied) {
			await interaction.followUp({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
		}
		log(e, 'error', 'red');
	}
};
