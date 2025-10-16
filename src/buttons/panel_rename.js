const { getServerDatas } = require('../../utils/functions/datas.js');

exports.run = async (client, interaction, config) => {
	const panelId = Number(interaction.customId.split('-')[1]);

	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	const modal = {
		custom_id: `panel_rename-${panelId}`,
		title: "Modifie le nom d'un Rôle-Play",
		components: [
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'new_name',
						label: 'Nouveau nom du rôle-play',
						style: 1,
						min_length: 1,
						max_length: 100,
						placeholder: 'Ex: Journaliste',
						...(panelDatas.name ? { value: panelDatas.name } : {}),
						required: true,
					},
				],
			},
		],
	};

	await interaction.showModal(modal);
};

exports.data = {
	name: 'config_panel_rename',
};

exports.conf = {
	type: 'Button',
};
