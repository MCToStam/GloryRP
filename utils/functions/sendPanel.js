const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const config = require("../../config.js");

async function sendPanelTasks(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);

  let errorMsg;
  if (!panel.tasks || panel.tasks.length === 0) {
    errorMsg = `Le panel **${panel.name}** n’a aucune tâche définie.`;
  }

  let channel;
  if (panel.channels.tasks) {
    channel = client.channels.cache.get(panel.channels.tasks);
    if (!channel) {
      errorMsg = `Le salon du panel **${panel.name}** n'est pas valide.`;
    }
  } else {
    errorMsg = `Le panel **${panel.name}** n’a aucune salon défini.`;
  }

  if (errorMsg) {
    return (erreurContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Erreur",
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: errorMsg,
        },
      ],
    });
  }

  const panelContainer = {
    type: 17,
    accent_color: config.couleur[serveur],
    components: [
      {
        type: 10,
        content: `## ${panel.emoji ? `${panel.emoji} ` : ""}${panel.name}`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content:
          panel.panel_message ||
          "Quand vous effectuez une tâche, il est nécessaire de le noter en cliquant sur le bouton correspondant !",
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `panel-tasks-${panel.id}`,
            placeholder: "Choisis une tâche",
            options: panel.tasks.map((task) => ({
              label: task.name,
              value: task.id.toString(),
              description: task.description || undefined,
              emoji: task.emoji || undefined,
            })),
          },
        ],
      },
    ],
  };

  const message = await channel.send({
    components: [panelContainer],
    flags: MessageFlags.IsComponentsV2,
  });

  return (goodContainer = {
    type: 17,
    accent_color: config.colors.sucess,
    components: [
      {
        type: 10,
        content: "## :white_check_mark: Panel Envoyé",
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content: `Le panel du rôle-play **${panel.name}** a correctement été envoyé ici :${message.url}`,
      },
    ],
  });
}

module.exports = { sendPanelTasks };
