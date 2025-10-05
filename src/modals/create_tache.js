const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditTacheContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const nom = interaction.fields.getTextInputValue("nom");
  const description = interaction.fields.getTextInputValue("description") || false;
  const emoji = interaction.fields.getTextInputValue("emoji") || false;
  const panelId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const nameExists = panelDatas.tasks.some(
    (p) => p.name.toLowerCase() === nom.toLowerCase()
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
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            "Ce nom est déjà utilisé par un autre grade, veuillez en choisir un autre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const modifDate = await toTimeStamp(new Date());

  const basePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "tacheBaseData.json"
  );
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf8"));

  let newId = 1;
  const existingIds = panelDatas.tasks.map((p) => p.taskId);
  while (existingIds.includes(newId)) {
    newId++;
  }

  const newTache = JSON.parse(JSON.stringify(baseData));

  newTache.taskId = newId;
  newTache.name = nom;
  newTache.description = description;
  newTache.emoji = emoji;

  panelDatas.tasks.push(newTache);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Création de la tâche ${nom}`,
  });

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  const panelPath = path.join(
    __dirname,
    `../../data/servers/${guildColor}.json`
  );
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2), "utf8");

  const goodContainer = await getEditTacheContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    newId
  );

  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "create_tache",
};
