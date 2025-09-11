module.exports = {
	panelsSelecString: {
		type: 1,
		components: [
			{
				type: 3,
				custom_id: 'config-panels',
				placeholder: 'Choisis un panel à configurer',
				options: [
					{
						label: 'Panel Avocat',
						value: 'config-panel-lawyer',
						description: "Configure le pannel des tâches avocat (plainte, anti-jeu, cours d'appel etc)",
						emoji: { name: '⚖️' },
					},
					{
						label: 'Panel Journaliste',
						value: 'config-panel-journalist',
						description: 'Configure le pannel des tâches journaliste (vidéo, short, article etc)',
						emoji: { name: '📰' },
					},
				],
			},
		],
	},
};
