exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const modal = {
    custom_id: `create_categorie-${boutiqueId}`,
    title: "Créer une nouvelle catégorie",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "nom",
            label: "Nom de la catégorie",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Drogue de Méchant",
            required: true,
          },
        ],
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

exports.data = { name: "create_categorie" };
