function getPanelsSelecString(serverDatas) {
  const panelOptions = [];

  for (const panel of serverDatas.panels) {
    if (panel.enable) {
      panelOptions.push({
        label: `Panel ${panel.name}`,
        value: `config-panel-${panel.id}`,
        description: panel.description || `Configure le panel ${panel.name}`,
        emoji: { name: panel.emoji },
      });
    }
  }

  return {
    type: 3,
    custom_id: "config-panels",
    placeholder:
      panelOptions.length === 0
        ? "Active d'abord un panel"
        : "Choisis un panel à configurer",
    max_values: 1,
    disabled: panelOptions.length === 0,
    options:
      panelOptions.length === 0
        ? [
            {
              label: "Active d'abord un panel",
              value: "no-panel-actived",
              description:
                "Tu ne peux pas configurer de panels si aucun n'est activé",
              emoji: { name: "❌" },
            },
          ]
        : panelOptions,
  };
}

module.exports = { getPanelsSelecString };