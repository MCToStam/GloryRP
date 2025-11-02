const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  const modal = {
    custom_id: `edit_tache_lien-${panelId}-${tache.taskId}`,
    title: "Modifie le lien forum d'une Tâche",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_link",
            label: "Nouveau lien forum de la tâche",
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: "Ex: https://nationsglory/forums/...",
            ...(tache.url ? { value: tache.url } : {}),
            required: false,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "edit_tache_lien",
};

exports.conf = {
  type: "User",
};
