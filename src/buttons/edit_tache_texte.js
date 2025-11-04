const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const modal = {
    custom_id: `edit_tache_texte-${panelId}`,
    title: "Modifier le texte du panel de tâche",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_texte",
            label: "Nouveau texte",
            style: 2,
            min_length: 0,
            max_length: 1000,
            placeholder:
              "Ex: Quand vous effectuez une tâche, il est nécessaire de le noter en cliquant sur le bouton...",
            ...(panelDatas.texte_tache
              ? { value: panelDatas.texte_tache }
              : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "edit_tache_texte",
};

exports.conf = {
  type: "User",
};
