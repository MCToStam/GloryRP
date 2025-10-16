const { getServerDatas, saveServerDatas, getGuildColor } = require('../../utils/functions/datas.js');
const { MessageFlags } = require('discord.js');
const { getEditTacheContainer } = require('../../components/containers.js');
const { toTimeStamp } = require('../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	const panelId = Number(interaction.customId.split('-')[1]);
	const taskId = Number(interaction.customId.split('-')[2]);

	const new_emoji = interaction.fields.getTextInputValue('new_emoji') || false;

	const guildColor = await getGuildColor(interaction);
	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
	const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

	const modifDate = await toTimeStamp(new Date());

	if (!serverDatas.logs) serverDatas.logs = [];
	serverDatas.logs.push({
		user: interaction.user.id,
		timestamp: modifDate,
		panel: panelId,
		action: `Modification de l'émoji de la tâche ${tache.name} en ${new_emoji}`,
	});

	tache.emoji = new_emoji;

	await saveServerDatas(interaction, serverDatas, guildColor);

	const goodContainer = await getEditTacheContainer(client, panelId, guildColor, panelDatas, taskId);
	return interaction.update({
		components: [goodContainer],
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		allowedMentions: { parse: [] },
	});
};

exports.data = {
	name: 'edit_tache_emoji',
};
