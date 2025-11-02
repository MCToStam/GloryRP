exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const modal = {
    custom_id: `effectif_addbutton-${panelId}`,
    title: "Créer un Bouton",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_label",
            label: "Nom du bouton",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Recrutement",
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_link",
            label: "Lien du bouton",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: https://nationsglory.fr/forums",
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "effectif_addbutton",
};

exports.conf = {
  type: "User",
};
