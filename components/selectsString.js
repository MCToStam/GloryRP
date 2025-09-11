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
						description: "Configure le panel des tâches avocat (plainte, anti-jeu, cours d'appel etc)",
						emoji: { name: '⚖️' },
					},
					{
						label: 'Panel Journaliste',
						value: 'config-panel-journalist',
						description: 'Configure le panel des tâches journaliste (vidéo, short, article etc)',
						emoji: { name: '📰' },
					},
					{
						label: 'Panel Regroupement',
						value: 'config-panel-regroupement',
						description: 'Configure le panel des tâches du regroupement des journalistes et des avocats',
						emoji: { name: '👥' },
					},
				],
			},
		],
	},
};
