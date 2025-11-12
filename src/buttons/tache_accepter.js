const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { discordStaff } = require("../../utils/functions/linkedUser.js");
const { updatePanelTasks } = require("../../utils/functions/sendPanel.js");
const {
  MessageFlags,
  SeparatorSpacingSize,
  ButtonStyle,
} = require("discord.js");

exports.run = async (client, interaction, config) => {
  const [, panelId, taskId, userId] = interaction.customId.split("-");
  const panelIdNumber = Number(panelId);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelIdNumber);

  if (!panelDatas) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        { type: 10, content: `## :x: Panel Introuvable` },
        { type: 14, spacing: SeparatorSpacingSize.Large },
        {
          type: 10,
          content: "Le panel lié à cette tâche n'existe pas ou a été supprimé.",
        },
      ],
    };
    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  if (!panelDatas.channels.logs) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Rôle-Play mal Configuré`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            'Ce rôle-play est mal configuré, en effet, aucun salon de type "logs" n\'a été définit.',
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const logsChannel = panelDatas.channels.logs
    ? interaction.guild.channels.cache.get(panelDatas.channels.logs)
    : null;

  if (!logsChannel) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Rôle-Play mal Configuré`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            'Ce rôle-play est mal configuré, en effet, le salon "logs" est invalide.',
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const { pseudonym, servers } = await discordStaff(interaction.user.id);
  if (!pseudonym) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Compte non Lié`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            "Ton compte Discord doit être lié à ton compte NationsGlory pour effectuer cette action.",
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: "https://glorybot.fr/user/profile",
              label: "🔗 Lier son Compte",
              style: ButtonStyle.Link,
            },
          ],
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const tache = panelDatas.tasks.find((t) => t.taskId === Number(taskId));

  const gradesAutorises = tache.grade_valider || [];
  const gradesDatas = panelDatas.grade.filter((g) =>
    gradesAutorises.includes(String(g.gradeId)),
  );

  const userHasAccess = gradesDatas.some((g) =>
    g.listeRp.includes(interaction.user.id),
  );

  if (!servers.includes(guildColor) && !userHasAccess) {
    const capitalizedguildColor =
      guildColor.charAt(0).toUpperCase() + guildColor.slice(1);
    const emojiId = config.emoji[guildColor.toLowerCase()];
    const permissionContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Permission Refusée",
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Tu n'as pas la permission d'effectuer cette action pour le serveur <:NG${capitalizedguildColor}:${emojiId}> **${capitalizedguildColor}** !`,
        },
      ],
    };
    return interaction.reply({
      components: [permissionContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  let found = false;
  for (const pseudo in panelDatas.salaire.salaire) {
    const moisDataKeys = Object.keys(panelDatas.salaire.salaire[pseudo]);
    for (const key of moisDataKeys) {
      const moisData = panelDatas.salaire.salaire[pseudo][key];
      if (!moisData || !moisData.taches) continue;
      for (const tache of moisData.taches) {
        if (tache.messageId === interaction.message.id) {
          const tacheContainer = {
            type: 17,
            accent_color: config.colors.success,
            components: [
              {
                type: 10,
                content: `## ${tache.emoji ? `${tache.emoji} ` : ""}${
                  tache.nom
                }`,
              },
              {
                type: 14,
                spacing: SeparatorSpacingSize.Large,
              },
              {
                type: 10,
                content: `Tâche demandée par <@${userId}> :\n> Détails : ${tache.details}\n> Salaire Attribué : ${tache.argent}$\n> Acceptée par <@${interaction.user.id}>`,
              },
              ...(tache.lien
                ? [
                    {
                      type: 14,
                      spacing: SeparatorSpacingSize.Large,
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          label: "🔗 Lien vers la Tâche",
                          url: tache.lien,
                          style: ButtonStyle.Link,
                        },
                      ],
                    },
                  ]
                : []),
            ],
          };

          const message = await logsChannel.send({
            components: [tacheContainer],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
          });

          tache.status = "accepted";
          tache.staff = pseudonym;
          tache.messageId = message.id;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }

  if (!found) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        { type: 10, content: `## :x: Tâche Introuvable` },
        { type: 14, spacing: SeparatorSpacingSize.Large },
        {
          type: 10,
          content: "Impossible de retrouver la tâche dans les données.",
        },
      ],
    };
    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  await interaction.message.delete().catch(() => {});

  await saveServerDatas(interaction, serverDatas, guildColor);

  const successContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
      { type: 10, content: `## :white_check_mark: Tâche Acceptée` },
      { type: 14, spacing: SeparatorSpacingSize.Large },
      { type: 10, content: `La tâche a été correctement été acceptée.` },
    ],
  };

  await interaction.reply({
    components: [successContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });

  await updatePanelTasks(client, guildColor, serverDatas, panelId);
};

exports.data = {
  name: "task_accepter",
};

exports.conf = {
  type: "Button",
};
