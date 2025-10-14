exports.run = async (client, interaction) => {
	const user = interaction.targetId;

	if (user === interaction.user.id) {
	}
};

exports.data = {
	name: 'user_cmd',
	type: 2,
};

exports.conf = {
	name: 'user_cmd',
};
