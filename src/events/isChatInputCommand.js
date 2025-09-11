const { Collection } = require('discord.js');
const config = require('../../config.js');
const log = require('../../utils/modules/logger.js');

module.exports = async (client, interaction) => {
	const slashCmd = client.container.slashCmds.get(interaction.commandName);
	if (!slashCmd) return;

	if (!slashCmd.conf.enabled) {
		return interaction.reply({ content: `**❌ | Cette commande est désactivée.**`, ephemeral: true });
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
				return interaction.reply({
					content: `**❌ | La commande est sous cooldown ➜ <t:${expiredTimestamp}:R>**`,
					ephemeral: true,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	}

	try {
		await slashCmd.run(client, interaction, config);
	} catch (e) {
		log(e, 'error', 'red');
	}
};
