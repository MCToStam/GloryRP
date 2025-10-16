exports.run = async (client, interaction, config) => {
	const modal = {
		custom_id: 'create_panel',
		title: 'Créer un nouveau rôle-play',
		components: [
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'nom',
						label: 'Nom du rôle-play',
						style: 1,
						min_length: 1,
						max_length: 100,
						placeholder: 'Ex: Avocat',
						required: true,
					},
				],
			},
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'description',
						label: 'Description du rôle-play',
						style: 1,
						min_length: 1,
						max_length: 100,
						placeholder: 'Ex: Gestion de la Justice du Serveur',
						required: false,
					},
				],
			},
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'emoji',
						label: 'Emoji du rôle-play',
						style: 1,
						min_length: 1,
						max_length: 100,
						placeholder: 'Ex: ⚖️',
						required: false,
					},
				],
			},
		],
	};

	await interaction.showModal(modal);
};

exports.data = { name: 'create_panel' };
