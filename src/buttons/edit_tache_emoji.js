const { getServerDatas } = require("../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  const modal = {
    custom_id: `edit_tache_emoji-${panelId}-${tache.taskId}`,
    title: "Modifie l'émoji d'une Tâche",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "new_emoji",
            label: "Nouvel émoji de la tâche",
            style: 1,
            min_length: 0,
            max_length: 100,
            placeholder: "Ex: 📜",
            ...(tache.emoji ? { value: tache.emoji } : {}),
            required: false,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "edit_tache_emoji",
};

exports.conf = {
  type: "User",
};
