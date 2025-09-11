function getPanelsSelecString(guildDatas) {
	const lawyerPanel = guildDatas.panels.find((x) => x.id === 'lawyer');
	const journalistPanel = guildDatas.panels.find((x) => x.id === 'journalist');
	const regroupementPanel = guildDatas.panels.find((x) => x.id === 'regroupement');
	const panelOptions = [];
	if (lawyerPanel.enable) {
		panelOptions.push({
			label: 'Panel Avocat',
			value: 'config-panel-lawyer',
			description: "Configure le panel des tâches avocat (plainte, anti-jeu, cours d'appel etc)",
			emoji: { name: '⚖️' },
		});
	}
	if (journalistPanel.enable) {
		panelOptions.push({
			label: 'Panel Journaliste',
			value: 'config-panel-journalist',
			description: 'Configure le panel des tâches journaliste (vidéo, short, article etc)',
			emoji: { name: '📰' },
		});
	}

	if (!lawyerPanel.enable && !journalistPanel.enable && regroupementPanel.enable) {
		panelOptions.push({
			label: 'Panel Regroupement',
			value: 'config-panel-regroupement',
			description: 'Configure le panel des tâches du regroupement des journalistes et des avocats',
			emoji: { name: '👥' },
		});
	}
	return {
		type: 3,
		custom_id: 'config-panels',
		placeholder: panelOptions.length == 0 ? "Active d'abord un panel" : 'Choisis un panel à configurer',
		max_values: 1,
		disabled: panelOptions.length == 0 ? true : false,
		options:
			panelOptions.length == 0 ?
				[
					{
						label: "Active d'abord un panel",
						value: 'no-panel-actived',
						description: "Tu ne peux pas configurer de panels si aucun n'est activé",
						emoji: { name: '❌' },
					},
				]
			:	panelOptions,
	};
}

module.exports = { getPanelsSelecString };
