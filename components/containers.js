const config = require("../config.js");
const {
  SeparatorSpacingSize,
  ButtonStyle,
  time,
  userMention,
} = require("discord.js");
const { getPanelsSelecString } = require("./selectsString.js");

async function getconfigContainer(serverDatas, serv) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelsComponents = serverDatas.panels.map((panel) => ({
    type: 9,
    components: [
      {
        type: 10,
        content: `${panel.emoji} Panel ${
          panel.name
        }`,
      },
    ],
    accessory: {
      type: 2,
      custom_id: `toggle-panel-${panel.id}`,
      label: panel.enable ? "Activé" : "Désactivé",
      emoji: { name: panel.enable ? "✅" : "❌" },
      style: panel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
    },
  }));

  return {
    type: 17,
    accent_color: config.couleur[serv],
    components: [
      {
        type: 10,
        content: "## :gear: Configuration du Role-Play " + servName,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      ...panelsComponents,
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [await getPanelsSelecString(serverDatas)],
      },
      {
        type: 10,
        content:
          "-# Dernières modifications par " +
          userMention(serverDatas.lastUser) +
          " " +
          (await time(serverDatas.timestamp, "R")),
      },
    ],
  };
}

module.exports = { getconfigContainer };
