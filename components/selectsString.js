function parseEmoji(emoji) {
  if (!emoji) return null;
  const customEmojiMatch = emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);
  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1],
      id: customEmojiMatch[2],
      animated: emoji.startsWith("<a:"),
    };
  }

  return { name: emoji };
}

function getPanelsSelecString(serverDatas) {
  const panelOptions = [];

  for (const panel of serverDatas.panels) {
    if (panel.enable) {
      const emoji = parseEmoji(panel.emoji);
      const option = {
        label: `Panel ${panel.name}`,
        value: `config-panel-${panel.id}`,
        description: panel.description || `Configure le panel ${panel.name}`,
      };
      if (emoji) option.emoji = emoji;
      panelOptions.push(option);
    }
  }

  panelOptions.push({
    label: "Créer un rôle-play",
    value: "create_panel",
    description: "Créer un nouveau rôle-play",
    emoji: { id: "1418880845808402492" },
  });

  return {
    type: 3,
    custom_id: "config-panels",
    placeholder: "Choisis un panel à configurer",
    max_values: 1,
    disabled: false,
    options: panelOptions,
  };
}

module.exports = { getPanelsSelecString };
