exports.run = async (client, interaction, config) => {
  const modal = {
    custom_id: "create_boutique",
    title: "Créer une nouvelle boutique",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "nom",
            label: "Nom de la boutique",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Rôle-Play",
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
            label: "Description de la boutique",
            style: 2,
            min_length: 1,
            max_length: 500,
            placeholder:
              "Ex: Cette boutique vous permet d'acheter de nombreuses drogues...",
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
            label: "Emoji de la boutique",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 🛒",
            required: false,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "create_boutique" };
