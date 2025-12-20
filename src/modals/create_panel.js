const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { getPanelContainer } = require("../../components/containers");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const nom = interaction.fields.getTextInputValue("nom");
  const description = interaction.fields.getTextInputValue("description");
  const emoji = interaction.fields.getTextInputValue("emoji");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  const nameExists = serverDatas.panels.some(
    (p) => p.name.toLowerCase() === nom.toLowerCase(),
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
            "Ce nom est déjà utilisé par un autre rôle-play, veuillez en choisir un autre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const modifDate = await toTimeStamp(new Date());

  const basePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "panelBaseData.json",
  );
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf8"));

  if (!serverDatas.panels) serverDatas.panels = [];

  let newId = 1;
  const existingIds = serverDatas.panels.map((p) => p.id);
  while (existingIds.includes(newId)) {
    newId++;
  }

  const newPanel = JSON.parse(JSON.stringify(baseData));

  newPanel.id = newId;
  newPanel.name = nom;
  newPanel.description = description;
  newPanel.emoji = emoji;
  newPanel.timestamp = modifDate;
  newPanel.lastUser = interaction.user.id;

  serverDatas.panels.push(newPanel);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: newId,
    action: "Création du rôle-play",
  });

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getPanelContainer(guildColor, newPanel, newId);

  return interaction.update({
    components: [goodContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "create_panel",
};
