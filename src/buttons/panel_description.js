const { getServerDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panelId = Number(interaction.customId.split('-')[1]);

	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	const modal = {
		custom_id: `panel_description-${panelId}`,
		title: "Modifie la description d'un Rôle-Play",
		components: [
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'new_description',
						label: 'Nouvelle description du rôle-play',
						style: 1,
						min_length: 0,
						max_length: 100,
						placeholder: 'Ex: Gestion de la Justice du Serveur',
						...(panelDatas.description ? { value: panelDatas.description } : {}),
						required: false,
					},
				],
			},
		],
	};

	await interaction.showModal(modal);
};

exports.data = {
	name: 'config_panel_description',
};

exports.conf = {
	type: 'Button',
};
