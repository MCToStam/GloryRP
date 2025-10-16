const { getGuildColor, saveServerDatas, getServerDatas } = require('../../../utils/functions/datas.js');
const { getEditGradeContainer } = require('../../../components/containers.js');
const { toTimeStamp } = require('../../../utils/functions/numbersAndLetters.js');

exports.run = async (client, interaction, config) => {
	await interaction.deferUpdate();

	const new_roles = interaction.values;
	const panelId = Number(interaction.customId.split('-')[1]);
	const gradeId = Number(interaction.customId.split('-')[2]);

	const guildColor = await getGuildColor(interaction);
	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
	const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);
	const modifDate = await toTimeStamp(new Date());

	if (!serverDatas.logs) serverDatas.logs = [];
	serverDatas.logs.push({
		user: interaction.user.id,
		timestamp: modifDate,
		panel: panelId,
		action: `Modification des rôles du grade ${grade.nom}`,
	});

	grade.role = new_roles;

	await saveServerDatas(interaction, serverDatas, guildColor);
	const salaireContainer = await getEditGradeContainer(client, panelId, guildColor, panelDatas, gradeId);

	await interaction.message.edit({
		components: [salaireContainer],
		allowedMentions: { parse: [] },
	});
};

exports.data = { name: 'edit_grade_role' };
