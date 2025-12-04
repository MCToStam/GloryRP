const { getServerDatas } = require("../../utils/functions/datas");

exports.run = async (client, interaction, config) => {
  const [_, panelIdStr, gradeIdStr, type] = interaction.customId.split("-");
  const panelId = Number(panelIdStr);
  const gradeId = Number(gradeIdStr);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((p) => p.id === panelId);
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

  const fields = {
    couleur: {
      title: "Modifie la couleur d'un Grade",
      label: "Nouvelle couleur du grade",
      placeholder: "Ex: #FF0000",
    },
    nom: {
      title: "Modifie le nom d'un Grade",
      label: "Nouveau nom du grade",
      placeholder: "Ex: Rédacteur en Chef",
    },
  };

  const field = fields[type];

  const modal = {
    custom_id: `edit_grade-${panelId}-${gradeId}-${type}`,
    title: field.title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: type,
            label: field.label,
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: field.placeholder,
            ...(grade[type] ? { value: grade[type] } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "edit_grade",
};
