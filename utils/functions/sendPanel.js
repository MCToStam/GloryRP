const config = require("../../config.js");
const { saveServerDatas } = require("../../utils/functions/datas.js");
const { getEmojiTete } = require("../../utils/functions/emojis.js");

function getValidTasks(panel, panelId) {
  return panel.tasks
    .filter(
      (task) =>
        task.type &&
        task.grade &&
        task.type !== "4" &&
        (!task.panelId || task.panelId === panelId),
    )
    .slice(0, 100);
}

async function buildWaitingTasks(client, panel) {
  if (!panel.panel_tache.description.includes("[attenteTache]")) {
    return "Aucune tâche en attente.";
  }

  const entries = Object.entries(panel.salaire.salaire || {});
  const tasksWaiting = [];

  for (const [pseudoRp, pseudoData] of entries) {
    for (const month of Object.values(pseudoData || {})) {
      for (const tache of month.taches || []) {
        if (tache.status === "waiting") {
          tasksWaiting.push({ tache, pseudoRp });
        }
      }
    }
  }

  if (tasksWaiting.length === 0) return "Aucune tâche en attente.";

  const lines = await Promise.all(
    tasksWaiting.map(async ({ tache, pseudoRp }) => {
      const emojiTete = await getEmojiTete(client, pseudoRp);
      const detail = tache.details
        ? `\n➩ *${
            tache.lien ? `[${tache.details}](${tache.lien})` : tache.details
          }*`
        : "";

      return `**${tache.nom}**, demandé par ${emojiTete} **${pseudoRp}**${detail}`;
    }),
  );

  return lines.join("\n");
}

function buildPanelContainer(serveur, panel, panelTexte, validTasks) {
  return {
    type: 17,
    accent_color: config.couleur[serveur],
    components: [
      {
        type: 10,
        content: `## ${panel.emoji ? `${panel.emoji} ` : ""}${panel.name}`,
      },
      { type: 14, spacing: 2 },
      { type: 10, content: panelTexte },
      { type: 14, spacing: 2 },

      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `panel_tasks-${panel.id}`,
            placeholder: "Choisis une tâche",
            options: validTasks.map((task) => {
              let emoji;
              if (task.emoji) {
                const match = task.emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);
                emoji = match
                  ? {
                      name: match[1],
                      id: match[2],
                      animated: task.emoji.startsWith("<a:"),
                    }
                  : { name: task.emoji };
              }

              return {
                label: task.name.substring(0, 25),
                value: `panel_tasks-${panel.id}-${task.taskId}`,
                description: task.description || undefined,
                ...(emoji ? { emoji } : {}),
              };
            }),
          },
        ],
      },
    ],
  };
}

async function buildPanelDescription(client, panel) {
  const waitingText = await buildWaitingTasks(client, panel);

  return panel.panel_tache.description.includes("[attenteTache]")
    ? panel.panel_tache.description.replace("[attenteTache]", waitingText)
    : panel.panel_tache.description;
}

async function sendPanelTasks(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);

  if (!panel?.tasks?.length) {
    return errorPanel(`Le panel **${panel.name}** n’a aucune tâche définie.`);
  }

  const channel = client.channels.cache.get(panel.channels?.tasks);
  if (!channel) {
    return errorPanel(`Le salon du panel **${panel.name}** n'est pas valide.`);
  }

  const validTasks = getValidTasks(panel, panelId);
  if (validTasks.length === 0) {
    return errorPanel(
      `Le panel **${panel.name}** n’a aucune tâche valide à afficher.`,
    );
  }

  const panelTexte = await buildPanelDescription(client, panel);
  const panelContainer = buildPanelContainer(
    serveur,
    panel,
    panelTexte,
    validTasks,
  );

  const message = await channel.send({
    components: [panelContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });

  panel.panel_tache.messageId = message.id;
  panel.panel_tache.channelId = channel.id;
  panel.panel_tache.guildId = channel.guild.id;

  saveServerDatas(false, serveurDatas, serveur);

  return {
    type: 17,
    accent_color: config.colors.success,
    components: [
      { type: 10, content: "## ✔️ Panel Envoyé" },
      { type: 14, spacing: 2 },
      {
        type: 10,
        content: `Le panel du rôle-play **${panel.name}** a été envoyé ici :${message.url}`,
      },
    ],
  };
}

async function updatePanelTasks(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);
  if (!panel?.panel_tache?.messageId) return;

  const channel = client.channels.cache.get(panel.panel_tache.channelId);
  if (!channel) return;

  const message = await channel.messages
    .fetch(panel.panel_tache.messageId)
    .catch(() => null);
  if (!message) return;

  const validTasks = getValidTasks(panel, panelId);
  const panelTexte = await buildPanelDescription(client, panel);
  const panelContainer = buildPanelContainer(
    serveur,
    panel,
    panelTexte,
    validTasks,
  );

  await message.edit({
    components: [panelContainer],
    flags: 32768,
  });
}

function errorPanel(text) {
  return {
    type: 17,
    accent_color: config.colors.error,
    components: [
      { type: 10, content: "## ❌ Erreur" },
      { type: 14, spacing: 2 },
      { type: 10, content: text },
    ],
  };
}

module.exports = { sendPanelTasks, updatePanelTasks };
