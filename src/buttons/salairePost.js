const { getServerDatas } = require("../../utils/functions/datas.js");
const { formatDateFr } = require("../../utils/functions/salairePost.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const salaireData = panelDatas.salaire?.salaire || {};
  const moisDisponiblesSet = new Set();

  Object.values(salaireData).forEach((joueurSalaires) => {
    Object.keys(joueurSalaires).forEach((mois) => {
      moisDisponiblesSet.add(mois);
    });
  });

  const moisDisponibles = Array.from(moisDisponiblesSet).sort();

  const modal = {
    custom_id: `salaire_post-${panelId}`,
    title: "Envoyer le salaire",
    components: [
      {
        type: 18,
        label: "Pour quel date envoyer le salaire ?",
        component: {
          type: 3,
          custom_id: "date",
          placeholder: "Sélectionne un mois",
          options: moisDisponibles.map((mois) => ({
            label: formatDateFr(mois),
            value: mois,
            description: "Envoyer le salaire pour ce mois",
          })),
        },
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "salairePost",
};

exports.conf = {
  type: "Button",
};
