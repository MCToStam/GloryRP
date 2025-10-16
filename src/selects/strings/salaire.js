const { getGuildColor, saveServerDatas, getServerDatas } = require('../../../utils/functions/datas.js');
const { getSalaireContainer } = require('../../../components/containers');
const { toTimeStamp } = require('../../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	await interaction.deferUpdate();

	const panelId = Number(interaction.values[0].split('-')[1]);

	const guildColor = await getGuildColor(interaction);
	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	panelDatas.salaire.automatique = !panelDatas.salaire.automatique;

	const modifDate = await toTimeStamp(new Date());
	if (!serverDatas.logs) serverDatas.logs = [];
	serverDatas.logs.push({
		user: interaction.user.id,
		timestamp: modifDate,
		panel: panelId,
		action: panelDatas.salaire.automatique ? 'Activation des salaires automatiques' : 'Désactivation des salaires automatiques',
	});

	await saveServerDatas(interaction, serverDatas, guildColor);
	const salaireContainer = await getSalaireContainer(panelId, guildColor, panelDatas);

	await interaction.message.edit({
		components: [salaireContainer],
		allowedMentions: { parse: [] },
	});
};

exports.data = { name: 'config_salaire' };
