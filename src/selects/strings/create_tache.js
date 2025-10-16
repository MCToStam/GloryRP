exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const modal = {
    custom_id: `create_tache-${panelId}`,
    title: "Créer une nouvelle tâche",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "nom",
            label: "Nom de la tâche",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Résumé ONU",
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "description",
            label: "Description de la tâche",
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: "Ex: Un résumé de l'ONU",
            required: false,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "emoji",
            label: "Emoji de la tâche",
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: "Ex: 📜",
            required: false,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "create_tache" };
