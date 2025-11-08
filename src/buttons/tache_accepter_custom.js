const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { discordStaff } = require("../../utils/functions/linkedUser.js");
const {
  MessageFlags,
  SeparatorSpacingSize,
  ButtonStyle,
} = require("discord.js");

exports.run = async (client, interaction, config) => {
  const [, panelId, taskId, userId] = interaction.customId.split("-");
  const panelIdNumber = Number(panelId);

  const serverDatas = await getServerDatas(interaction);
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

  const guildColor = await getGuildColor(interaction);
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

  const gradesAutorises = tache.grade_valider;
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

  let tacheFound = null;
  for (const pseudo in panelDatas.salaire.salaire) {
    const moisKeys = Object.keys(panelDatas.salaire.salaire[pseudo]);
    for (const key of moisKeys) {
      const moisData = panelDatas.salaire.salaire[pseudo][key];
      if (!moisData || !moisData.taches) continue;
      for (const tache of moisData.taches) {
        if (tache.messageId === interaction.message.id) {
          tacheFound = tache;
          break;
        }
      }
      if (tacheFound) break;
    }
    if (tacheFound) break;
  }

  const modal = {
    custom_id: `task_accepter_custom-${panelId}-${taskId}-${userId}`,
    title: "Définir un salaire customisé pour cette tâche",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_salaire",
            label: "Nouvelle salaire à attribuer",
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: "Ex: 5000",
            ...(tacheFound && tacheFound.argent
              ? { value: tacheFound.argent }
              : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "task_accepter_custom",
};

exports.conf = {
  type: "Button",
};
