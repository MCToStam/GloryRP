const { getServerDatas } = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);
  const type = interaction.customId.split("-")[3];

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  const fields = {
    description: {
      title: "Modifie la description de la Tâche",
      label: "Nouvelle description de la tâche",
      placeholder: "Ex: Un résumé de l'ONU",
    },
    name: {
      title: "Modifie le nom de la Tâche",
      label: "Nouveau nom de la tâche",
      placeholder: "Ex: Résumé ONU",
    },
    emoji: {
      title: "Modifie l'émoji de la Tâche",
      label: "Nouvel émoji de la tâche",
      placeholder: "Ex: 📜",
    },
    url: {
      title: "Modifie le lien de la Tâche",
      label: "Nouveau lien de la tâche",
      placeholder: "Ex: https://nationsglory/forums/...",
    },
  };

  const field = fields[type];

  const modal = {
    custom_id: `tache_edit-${panelId}-${tache.taskId}-${type}`,
    title: field.title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: type,
            label: field.label,
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: field.placeholder,
            ...(tache[type] ? { value: tache[type] } : {}),
            required: false,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "tache_edit",
};
