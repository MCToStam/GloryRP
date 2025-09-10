module.exports = async (client, interaction) => {
	if (interaction.type === 1) {
		//!Ping
	} else if (interaction.type === 2) {
		//!ApplicationCommand
		if (interaction.commandType === 1) {
			//-ChatInput
			return client.emit('isChatInputCommand', interaction);
		} else if (interaction.commandType === 2) {
			//-User
			return client.emit('isUserContextMenu', interaction);
		} else if (interaction.commandType === 3) {
			//-Message
			return client.emit('isMessageContextMenu', interaction);
		} else if (interaction.commandType === 4) {
			//-PrimaryEntryPoint
			return;
		}
	} else if (interaction.type === 3) {
		//!MessageComponent

		if (interaction.componentType === 1) {
			//-ActionRow
		} else if (interaction.componentType === 2) {
			//-Button
			return client.emit('isButton', interaction);
		} else if (interaction.type === 3) {
			//-StringSelect
			return client.emit('isStringSelect', interaction);
		} else if (interaction.type === 4) {
			//-TextInput
		} else if (interaction.type === 5) {
			//-UserSelect
		} else if (interaction.type === 6) {
			//-RoleSelect
		} else if (interaction.type === 7) {
			//-MentionableSelect
		} else if (interaction.type === 8) {
			//-ChannelSelect
		}
	} else if (interaction.type === 4) {
		//!ApplicationCommandAutocomplete
		return client.emit('isAutoComplete', interaction);
	} else if (interaction.type === 5) {
		//!ModalSubmit
		return client.emit('isModalSubmit', interaction);
	} else {
		return;
	}
};
