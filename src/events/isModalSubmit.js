module.exports = async (client, interaction) => {
	const modal = client.container.modals.get(interaction.customId);
	if (!modal) return;

	try {
		await modal.run(client, interaction);
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
