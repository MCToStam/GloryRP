const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const {
  getBoutiqueArticleContainer,
} = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const nom = interaction.fields.getTextInputValue("nom");
  const categorie = Number(
    interaction.fields.getStringSelectValues("categorie")[0],
  );
  const prix = interaction.fields.getTextInputValue("prix");
  const grade = interaction.fields.getStringSelectValues("grade");

  const boutiqueId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutique = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const nameExists = boutique.article.some(
    (a) => a.nom.toLowerCase() === nom.toLowerCase(),
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
            "Ce nom est déjà utilisé par un autre article, veuillez en choisir un autre.",
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
    "..",
    "data",
    "articleBaseData.json",
  );
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf8"));

  if (!boutique.article) boutique.article = [];

  let newId = 1;
  const existingIds = boutique.article.map((p) => p.id);
  while (existingIds.includes(newId)) {
    newId++;
  }

  const newArticle = JSON.parse(JSON.stringify(baseData));

  newArticle.id = newId;
  newArticle.nom = nom;
  newArticle.categorie = categorie;
  newArticle.prix = prix;
  newArticle.grade = grade;
  boutique.timestamp = modifDate;
  boutique.lastUser = interaction.user.id;

  boutique.article.push(newArticle);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: newId,
    action: `Création de l'article ${nom}`,
  });

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getBoutiqueArticleContainer(
    boutiqueId,
    guildColor,
    boutique,
    1,
  );

  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "create_article",
};
