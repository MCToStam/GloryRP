const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const {
  getBoutiqueCategorieContainer,
} = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

function formatHexColor(input) {
  let color = input.toUpperCase();
  if (!color.startsWith("#")) color = "#" + color;
  if (!/^#[0-9A-F]{6}$/.test(color)) return null;
  return color;
}

exports.run = async (client, interaction, config) => {
  const nom = interaction.fields.getTextInputValue("nom");
  const couleur = formatHexColor(
    interaction.fields.getTextInputValue("couleur"),
  );
  const boutiqueId = Number(interaction.customId.split("-")[1]);

  if (!couleur) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Couleur Invalide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "La couleur doit être au format hexadecimal.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const nameExists = boutiqueDatas.categorie.some(
    (c) => c.nom.toLowerCase() === nom.toLowerCase(),
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
            "Ce nom est déjà utilisé par une autre catégorie, veuillez en choisir un autre.",
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
    "categorieBaseData.json",
  );
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf8"));

  if (!boutiqueDatas.categorie) boutiqueDatas.categorie = [];

  let newId = 1;
  const existingIds = boutiqueDatas.categorie.map((c) => c.id);
  while (existingIds.includes(newId)) {
    newId++;
  }

  const newPanel = JSON.parse(JSON.stringify(baseData));

  newPanel.id = newId;
  newPanel.nom = nom;
  newPanel.couleur = couleur;

  boutiqueDatas.categorie.push(newPanel);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: boutiqueId,
    action: `Création de la catégorie ${nom}`,
  });

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getBoutiqueCategorieContainer(
    client,
    boutiqueId,
    guildColor,
    boutiqueDatas,
  );

  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "create_categorie",
};
