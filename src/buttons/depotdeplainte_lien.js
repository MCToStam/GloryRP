const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const modal = {
    custom_id: `config_depotdeplainte_lien-${panelId}`,
    title: "Modifie le lien forum du Dépôt de Plainte",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_lien",
            label: "Nouveau lien",
            style: 1,
            min_length: 1,
            max_length: 200,
            placeholder: "Ex: https://nationsglory.fr/forums",
            ...(panelDatas.depotdeplainte.lien ? { value: panelDatas.depotdeplainte.lien } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "config_depotdeplainte_lien",
};

exports.conf = {
  type: "Button",
};