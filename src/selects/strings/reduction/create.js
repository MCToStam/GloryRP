exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);

  const modal = {
    custom_id: `reduction_create-${boutiqueId}`,
    title: "Créer une nouvelle réduction",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "code",
            label: "Code de réduction",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: NOEL2025",
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "debut",
            label: "Date et heure de début",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 14/12/2025 15h00",
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "fin",
            label: "Date et heure de fin",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 17/12/2025 18h00",
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "reduction_create" };
