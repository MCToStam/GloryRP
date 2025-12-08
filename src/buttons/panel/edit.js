const { getServerDatas } = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const [_, action, panelId] = interaction.customId.split("-");
  const id = Number(panelId);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === id);

  const modalConfigs = {
    description: {
      customId: `panel_edit-description-${id}`,
      title: "Modifie la description d'un Rôle-Play",
      field: {
        id: "description",
        label: "Nouvelle description du rôle-play",
        placeholder: "Ex: Gestion de la Justice du Serveur",
        required: false,
        min: 0,
        max: 100,
        value: panelDatas.description,
      },
    },
    emoji: {
      customId: `panel_edit-emoji-${id}`,
      title: "Modifie l'émoji d'un Rôle-Play",
      field: {
        id: "emoji",
        label: "Nouvel émoji du rôle-play",
        placeholder: "Ex: ⚖️",
        required: false,
        min: 0,
        max: 100,
        value: panelDatas.emoji,
      },
    },
    name: {
      customId: `panel_edit-name-${id}`,
      title: "Modifie le nom d'un Rôle-Play",
      field: {
        id: "name",
        label: "Nouveau nom du rôle-play",
        placeholder: "Ex: Journaliste",
        required: true,
        min: 1,
        max: 100,
        value: panelDatas.name,
      },
    },
  };

  const conf = modalConfigs[action];
  if (!conf) return;

  const modal = {
    custom_id: conf.customId,
    title: conf.title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: conf.field.id,
            label: conf.field.label,
            style: 1,
            min_length: conf.field.min,
            max_length: conf.field.max,
            placeholder: conf.field.placeholder,
            ...(conf.field.value ? { value: conf.field.value } : {}),
            required: conf.field.required,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "panel_edit",
};
