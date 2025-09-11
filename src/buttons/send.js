exports.run = async (client, interaction) => {
	const guildDatas = await getGuildDatas(interaction);
	const guildColor = await getGuildColor(interaction);

	
};

exports.data = {
	name: 'send',
};

exports.conf = {
	type: 'User',
};
