const { getServerDatas } = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const modal = {
    custom_id: `config_salaire-cmd-${panelId}`,
    title: "Configurer les commandes de salaire",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "money_take",
            label: "Commande pour prendre l'argent total",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: /econ bank take ONU [somme]",
            value: panelDatas.salaire.cmd_retrait,
            required: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "money_give",
            label: "Commande pour donner l'argent à un joueur",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: /eco give [joueur] [somme]",
            value: panelDatas.salaire.cmd_don,
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "cmd_salaire",
};
