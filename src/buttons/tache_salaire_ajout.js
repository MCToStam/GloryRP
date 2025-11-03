const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const [_, type, joueur, panelId, serv, mois] =
    interaction.customId.split("-");

  const modal = {
    custom_id: `salaire_tache_ajout-${type}-${joueur}-${panelId}-${serv}-${mois}`,
    title: `Ajouter un ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "argent",
            label: "Nouveau nom de la tâche",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 5000",
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "motif",
            label: `Motif du ${type}`,
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: `Ex: ${type === "bonus" ? "Fait du très bon travail" : "Fait du mauvais travail"}`,
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "salaire_tache_ajout",
};

exports.conf = {
  type: "User",
};
