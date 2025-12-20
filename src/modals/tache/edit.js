const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { getEditTacheContainer } = require("../../../components/containers");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);
  const type = interaction.customId.split("-")[3];

  const newData = interaction.fields.getTextInputValue(type) || false;

  if (
    type === "url" &&
    newData &&
    !newData.startsWith("https://nationsglory.fr/forums/category")
  ) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Lien Invalide`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            'Le lien doit être une catégorie du forum de NationsGlory, donc commençant par l\'URL "https://nationsglory.fr/forums/category".',
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  if (type === "name") {
    const nameExists = panelDatas.tasks.some(
      (t) =>
        t.taskId !== taskId && t.name.toLowerCase() === newData.toLowerCase(),
    );
    if (nameExists) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## :no_entry: Nom déjà Utilisé`,
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content:
              "Ce nom est déjà utilisé par une autre tâche, veuillez en choisir un autre.",
          },
        ],
      };
    }
  }

  const modifDate = await toTimeStamp(new Date());

  const textLog = {
    description: "de la description",
    name: "du nom",
    emoji: "de l'émoji",
    url: "du lien",
  };

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification ${textLog[type]} de la tâche ${tache.name} en ${newData}`,
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

  tache[type] = newData;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEditTacheContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    taskId,
  );
  return interaction.update({
    components: [goodContainer],
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "tache_edit",
};
