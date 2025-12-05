const {
  getServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.values[0].split("-")[1]);
  const categorieId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const categorie = boutiqueDatas.categorie.find((c) => c.id === categorieId);

  const modal = {
    custom_id: `edit_categorie-${boutiqueId}-${categorieId}`,
    title: "Modifier la catégorie",
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
            ...(categorie.nom ? { value: categorie.nom } : {}),
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
            ...(categorie.couleur ? { value: categorie.couleur } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "categorie_edit" };
