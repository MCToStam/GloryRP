exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const modal = {
    custom_id: `create_grade-${panelId}`,
    title: "Créer un nouveau grade",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "nom",
            label: "Nom du grade",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Rédacteur en Chef",
            required: true,
          },
        ],
      },
      {
        type: 18,
        label: "Tier du grade",
        component: {
          type: 3,
          custom_id: "tier",
          placeholder: "Sélectionne un tier",
          options: [
            {
              label: "Tier 1",
              value: "1",
              description: "Choisit le Tier 1",
            },
            {
              label: "Tier 2",
              value: "2",
              description: "Choisit le Tier 2",
            },
            {
              label: "Tier 3",
              value: "3",
              description: "Choisit le Tier 3",
            },
            {
              label: "Tier 4",
              value: "4",
              description: "Choisit le Tier 4",
            },
            {
              label: "Tier 5",
              value: "5",
              description: "Choisit le Tier 5",
            },
          ],
        },
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "couleur",
            label: "Couleur du grade",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: #FF0000",
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "create_grade" };
