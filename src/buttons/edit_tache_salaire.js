const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  const modal = {
    custom_id: `edit_tache_salaire-${panelId}-${tache.taskId}`,
    title: "Modifie le salaire d'une Tâche",
    components: [
      {
        type: 18,
        label: "Pour quel jour modifier le salaire",
        component: {
          type: 3,
          custom_id: "jour",
          placeholder: "Sélectionne un jour",
          options: [
            {
              label: "Tous les jours",
              value: "all",
              description: "Modifier le salaire de la tâche globalement",
            },
            {
              label: "Lundi",
              value: "lundi",
              description: "Modifier le salaire de la tâche envoyé le lundi",
            },
            {
              label: "Mardi",
              value: "mardi",
              description: "Modifier le salaire de la tâche envoyé le mardi",
            },
            {
              label: "Mercredi",
              value: "mercredi",
              description: "Modifier le salaire de la tâche envoyé le mercredi",
            },
            {
              label: "Jeudi",
              value: "jeudi",
              description: "Modifier le salaire de la tâche envoyé le jeudi",
            },
            {
              label: "Vendredi",
              value: "vendredi",
              description: "Modifier le salaire de la tâche envoyé le vendredi",
            },
            {
              label: "Samedi",
              value: "samedi",
              description: "Modifier le salaire de la tâche envoyé le samedi",
            },
            {
              label: "Dimanche",
              value: "dimanche",
              description: "Modifier le salaire de la tâche envoyé le dimanche",
            },
          ],
        },
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_salaire",
            label: "Nouveau salaire de la tâche",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 5000",
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "edit_tache_salaire",
};

exports.conf = {
  type: "User",
};
