const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { discordStaff } = require("../../../utils/functions/linkedUser.js");
const { updatePanelTasks } = require("../../../utils/functions/sendPanel.js");

exports.run = async (client, interaction, config) => {
  const [, panelId, taskId, userId] = interaction.customId.split("-");
  const panelIdNumber = Number(panelId);

  const new_salaire = interaction.fields.getTextInputValue("new_salaire") || 0;

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelIdNumber);

  if (!panelDatas) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        { type: 10, content: `## :x: Panel Introuvable` },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: "Le panel lié à cette tâche n'existe pas ou a été supprimé.",
        },
      ],
    };
    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
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
          spacing: 2,
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
      flags: 32768 | 64,
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
          spacing: 2,
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
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const serveur = await getGuildColor(interaction);
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
          spacing: 2,
        },
        {
          type: 10,
          content:
            "Ton compte Discord doit être lié à ton compte NationsGlory pour effectuer cette action.",
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: "https://glorybot.fr/user/profile",
              label: "🔗 Lier son Compte",
              style: 5,
            },
          ],
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (!servers.includes(serveur)) {
    const capitalizedServeur =
      serveur.charAt(0).toUpperCase() + serveur.slice(1);
    const emojiId = config.emoji[serveur.toLowerCase()];
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
          spacing: 2,
        },
        {
          type: 10,
          content: `Tu n'as pas la permission d'effectuer cette action pour le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
        },
      ],
    };
    return interaction.reply({
      components: [permissionContainer],
      flags: 32768 | 64,
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
                spacing: 2,
              },
              {
                type: 10,
                content: `Tâche demandée par <@${userId}> :\n> Détails : ${tache.details}\n> Salaire Attribué : ${new_salaire}$\n> Acceptée par <@${interaction.user.id}>`,
              },
              ...(tache.lien
                ? [
                    {
                      type: 14,
                      spacing: 2,
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          label: "🔗 Lien vers la Tâche",
                          url: tache.lien,
                          style: 5,
                        },
                      ],
                    },
                  ]
                : []),
            ],
          };

          const message = await logsChannel.send({
            components: [tacheContainer],
            flags: 32768,
            allowedMentions: { parse: [] },
          });

          tache.status = "accepted";
          tache.argent = Number(new_salaire);
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
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: "Impossible de retrouver la tâche dans les données.",
        },
      ],
    };
    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
    });
  }

  await interaction.message.delete().catch(() => {});

  await saveServerDatas(interaction, serverDatas, guildColor);

  const successContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
      { type: 10, content: `## :white_check_mark: Tâche Acceptée` },
      { type: 14, spacing: 2 },
      { type: 10, content: `La tâche a été correctement été acceptée.` },
    ],
  };

  await interaction.reply({
    components: [successContainer],
    flags: 32768 | 64,
  });

  await updatePanelTasks(client, guildColor, serverDatas, panelId);
};

exports.data = {
  name: "task_accepter_custom",
};
