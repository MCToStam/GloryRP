const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const config = require("../../config.js");
const { saveServerDatas } = require("../../utils/functions/datas.js");
const { getEmojiTete } = require("../../utils/functions/emojis.js");

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
    return {
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
    };
  }

  const validTasks = panel.tasks
    .filter(
      (task) =>
        task.type &&
        task.grade &&
        task.type !== "4" &&
        (!task.panelId || task.panelId === panelId),
    )
    .slice(0, 100);

  if (validTasks.length === 0) {
    return {
      type: 17,
      accent_color: config.colors.error,
      components: [
        { type: 10, content: "## :no_entry_sign: Erreur" },
        { type: 14, spacing: SeparatorSpacingSize.Large },
        {
          type: 10,
          content: `Le panel **${panel.name}** n’a aucune tâche valide à afficher.`,
        },
      ],
    };
  }

  let attenteTachesTexte = "Aucune tâche en attente.";

  if (panel.panel_tache.description.includes("[attenteTache]")) {
    const tachesEnAttente = Object.entries(panel.salaire.salaire || {}).flatMap(
      ([pseudoRp, pseudoRpData]) =>
        Object.values(pseudoRpData || {}).flatMap((month) =>
          (month.taches || [])
            .filter((t) => t.status === "waiting")
            .map((t) => ({
              tache: t,
              pseudoRp,
            })),
        ),
    );

    if (tachesEnAttente.length > 0) {
      const textes = await Promise.all(
        tachesEnAttente.map(async ({ tache, pseudoRp }) => {
          const emojiTete = await getEmojiTete(client, pseudoRp);
          return `**${tache.nom}**, demandé par ${emojiTete} **${pseudoRp}**${
            tache.details
              ? `\n➩ *${
                  tache.lien
                    ? `[${tache.details}](${tache.lien})`
                    : `${tache.details}`
                }*`
              : ""
          }`;
        }),
      );
      attenteTachesTexte = textes.join("\n");
    }
  }

  const panelTexte = panel.panel_tache.description.includes("[attenteTache]")
    ? panel.panel_tache.description.replace(
        "[attenteTache]",
        attenteTachesTexte,
      )
    : panel.panel_tache.description;

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
        content: panelTexte,
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
            custom_id: `panel_tasks-${panel.id}`,
            placeholder: "Choisis une tâche",
            options: validTasks.map((task) => {
              let emoji;
              if (task.emoji) {
                const customEmojiMatch = task.emoji.match(
                  /^<a?:([a-zA-Z0-9_]+):(\d+)>$/,
                );
                if (customEmojiMatch) {
                  emoji = {
                    name: customEmojiMatch[1],
                    id: customEmojiMatch[2],
                    animated: task.emoji.startsWith("<a:"),
                  };
                } else {
                  emoji = { name: task.emoji };
                }
              }

              return {
                label: task.name.substring(0, 25),
                value: `panel_tasks-${panelId}-${String(task.taskId)}`,
                description: task.description || undefined,
                ...(emoji ? { emoji } : {}),
              };
            }),
          },
        ],
      },
    ],
  };

  const message = await channel.send({
    components: [panelContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });

  panel.panel_tache.messageId = message.id;
  panel.panel_tache.channelId = message.channel.id;
  panel.panel_tache.guildId = message.guild.id;

  saveServerDatas(false, serveurDatas, serveur);

  return {
    type: 17,
    accent_color: config.colors.success,
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
  };
}

async function updatePanelTasks(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);

  if (!panel || !panel.panel_tache || !panel.panel_tache.messageId) return;

  let channel = client.channels.cache.get(panel.panel_tache.channelId);
  if (!channel) return;

  const validTasks = panel.tasks
    .filter(
      (task) =>
        task.type &&
        task.grade &&
        task.type !== "4" &&
        (!task.panelId || task.panelId === panelId),
    )
    .slice(0, 100);

  let attenteTachesTexte = "Aucune tâche en attente.";

  if (panel.panel_tache.description.includes("[attenteTache]")) {
    const tachesEnAttente = Object.entries(panel.salaire.salaire || {}).flatMap(
      ([pseudoRp, pseudoRpData]) =>
        Object.values(pseudoRpData || {}).flatMap((month) =>
          (month.taches || [])
            .filter((t) => t.status === "waiting")
            .map((t) => ({ tache: t, pseudoRp })),
        ),
    );

    if (tachesEnAttente.length > 0) {
      const textes = await Promise.all(
        tachesEnAttente.map(async ({ tache, pseudoRp }) => {
          const emojiTete = await getEmojiTete(client, pseudoRp);
          return `**${tache.nom}**, demandé par ${emojiTete} **${pseudoRp}**${
            tache.details
              ? `\n➩ *${
                  tache.lien
                    ? `[${tache.details}](${tache.lien})`
                    : `${tache.details}`
                }*`
              : ""
          }`;
        }),
      );
      attenteTachesTexte = textes.join("\n");
    }
  }

  const panelTexte = panel.panel_tache.description.includes("[attenteTache]")
    ? panel.panel_tache.description.replace(
        "[attenteTache]",
        attenteTachesTexte,
      )
    : panel.panel_tache.description;

  const panelContainer = {
    type: 17,
    accent_color: config.couleur[serveur],
    components: [
      {
        type: 10,
        content: `## ${panel.emoji ? `${panel.emoji} ` : ""}${panel.name}`,
      },
      { type: 14, spacing: SeparatorSpacingSize.Large },
      { type: 10, content: panelTexte },
      { type: 14, spacing: SeparatorSpacingSize.Large },
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
                const customEmojiMatch = task.emoji.match(
                  /^<a?:([a-zA-Z0-9_]+):(\d+)>$/,
                );
                if (customEmojiMatch) {
                  emoji = {
                    name: customEmojiMatch[1],
                    id: customEmojiMatch[2],
                    animated: task.emoji.startsWith("<a:"),
                  };
                } else {
                  emoji = { name: task.emoji };
                }
              }
              return {
                label: task.name.substring(0, 25),
                value: `panel_tasks-${panelId}-${String(task.taskId)}`,
                description: task.description || undefined,
                ...(emoji ? { emoji } : {}),
              };
            }),
          },
        ],
      },
    ],
  };

  const message = await channel.messages.fetch(panel.panel_tache.messageId);
  if (!message) return;

  await message.edit({
    components: [panelContainer],
    flags: MessageFlags.IsComponentsV2,
  });
}

module.exports = { sendPanelTasks, updatePanelTasks };
