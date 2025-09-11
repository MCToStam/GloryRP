const { getconfigContainer } = require('../../components/containers');
const { getGuildColor, getGuildDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction) => {
	const guildDatas = await getGuildDatas(interaction);
	const guildColor = await getGuildColor(interaction);
	const configContainer = await getconfigContainer(guildDatas, guildColor);
	await interaction.message.edit({ components: [configContainer] });
};

exports.data = {
	name: 'return',
};

exports.conf = {
	type: 'User',
};
