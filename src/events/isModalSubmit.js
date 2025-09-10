module.exports = async (client, interaction) => {
	const modal = client.container.modals.get(interaction.customId);
	if (!modal) return;

	try {
		await modal.run(client, interaction);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
