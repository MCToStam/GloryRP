const { getServerDatas, getGuildColor } = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const fs = require("node:fs");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.values[0].split("-")[1]);
  const taskId = Number(interaction.values[0].split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const panelIndex = panelDatas.tasks.findIndex((x) => x.taskId === taskId);
  if (panelIndex === -1) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Tâche Introuvable`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Cette tâche n'existe pas ou a été supprimée.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  if ((tache.type === "2" || tache.type === "3") && !tache.url) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Tâche mal Configurée`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Cette tâche est mal configurée, en effet aucune catégorie forum n'est définie, or elle est obligatoire pour le type "${tache.type}" de valitation.`,
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const modal = {
    custom_id: `panel_tasks-${panelId}-${taskId}`,
    title: `Tâche ${tache.name}`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "details",
            label:
              tache.type === "1"
                ? "Détails sur la tâche effectuée"
                : "Titre ou lien vers la discussion forum",
            style: tache.type === "1" ? 2 : 1,
            min_length: 1,
            max_length: 200,
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "panel_tasks" };
