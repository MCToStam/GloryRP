const { getServerDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panelId = Number(interaction.customId.split('-')[1]);
	const gradeId = Number(interaction.customId.split('-')[2]);

	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
	const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

	const modal = {
		custom_id: `edit_grade_couleur-${panelId}-${gradeId}`,
		title: "Modifie la couleur d'un Grade",
		components: [
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'new_color',
						label: 'Nouvelle couleur du grade',
						style: 1,
						min_length: 1,
						max_length: 100,
						placeholder: 'Ex: #FF0000',
						...(grade.couleur ? { value: grade.couleur } : {}),
						required: true,
					},
				],
			},
		],
	};

	await interaction.showModal(modal);
};

exports.data = {
	name: 'edit_grade_couleur',
};

exports.conf = {
	type: 'Button',
};
