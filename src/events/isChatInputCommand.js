const { Collection, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const config = require('../../config.js');
const log = require('../../utils/modules/logger.js');

module.exports = async (client, interaction) => {
	const slashCmd = client.container.slashCmds.get(interaction.commandName);
	if (!slashCmd) return;

	if (!slashCmd.conf.enabled) {
		const disabledContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: '## :no_entry_sign: Commande Désactivée ',
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: "Cette commande est désactivé et donc innaccessible.",
				},
			],
		};
		return interaction.reply({ components: [disabledContainer], flags: MessageFlags.IsComponentsV2 });
	}

	const { cooldowns } = client;

	if (!cooldowns.has(slashCmd.data.name)) {
		cooldowns.set(slashCmd.data.name, new Collection());
	}

	if (interaction.user.id !== config.owner) {
		const now = Date.now();
		const timestamps = cooldowns.get(slashCmd.data.name);
		const defaultCooldownDuration = 5;
		const cooldownAmount = (slashCmd.conf.cooldown ?? defaultCooldownDuration) * 1000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				const cooldownContainer = {
					type: 17,
					accent_color: config.colors.error,
					components: [
						{
							type: 10,
							content: '## :no_entry_sign: Cooldown ',
						},
						{
							type: 14,
							spacing: SeparatorSpacingSize.Large,
						},
						{
							type: 10,
							content: `Cette commande est actuellement sous cooldown, tu pourras la réutiliser <t:${expiredTimestamp}:R>.`,
						},
					],
				};
				return interaction.reply({
					components: [cooldownContainer],
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	}

	try {
		await slashCmd.run(client, interaction, config);
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
