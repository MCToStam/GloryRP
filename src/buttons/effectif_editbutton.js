const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const buttonLabel = interaction.customId.split("-")[2];

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const button = panelDatas.effectif.button.find(
    (b) => b.label === buttonLabel,
  );

  const modal = {
    custom_id: `effectif_editbutton-${panelId}-${buttonLabel}`,
    title: "Modifie le Bouton",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_label",
            label: "Nouveau nom du bouton",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Recrutement",
            ...(button.label ? { value: button.label } : {}),
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
            label: "Nouveau lien du bouton",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: https://nationsglory.fr/forums",
            ...(button.lien ? { value: button.lien } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "effectif_editbutton",
};

exports.conf = {
  type: "User",
};
