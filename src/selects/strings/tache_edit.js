const { getEditTacheContainer } = require('../../../components/containers.js');
const { getServerDatas, getGuildColor } = require('../../../utils/functions/datas.js');
const { MessageFlags } = require('discord.js');

exports.run = async (client, interaction, config) => {
	await interaction.deferUpdate();

	const panelId = Number(interaction.values[0].split('-')[1]);
	const tacheId = Number(interaction.values[0].split('-')[2]);

	const guildColor = await getGuildColor(interaction);
	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	const tacheContainer = await getEditTacheContainer(client, panelId, guildColor, panelDatas, tacheId);
	return interaction.editReply({
		components: [tacheContainer],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { parse: [] },
	});
};

exports.data = {
	name: 'tache_edit',
};
