const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiqueEditArticleContainer,
} = require("../../../components/containers");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");
const fs = require("node:fs/promises");
const path = require("node:path");

function formatHexColor(input) {
  const color = input.startsWith("#")
    ? input.toUpperCase()
    : "#" + input.toUpperCase();

  return /^#[0-9A-F]{6}$/.test(color) ? color : null;
}

exports.run = async (client, interaction, config) => {
  const [_, boutiqueIdStr, articleIdStr, type] =
    interaction.customId.split("-");
  const boutiqueId = Number(boutiqueIdStr);
  const articleId = Number(articleIdStr);

  let newValue;
  if (type !== "image") newValue = interaction.fields.getTextInputValue(type);
  if (type === "image") newValue = interaction.fields.getUploadedFiles(type);
  if (type === "couleur") newValue = formatHexColor(newValue);
  if (type === "prix" || type === "quantite")
    newValue = Number(newValue.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, ""));
  if (type === "image" && !newValue.first().contentType?.startsWith("image/"))
    newValue = false;

  if (!newValue) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: ${
            type === "couleur"
              ? "Couleur"
              : type === "nom"
                ? "Nom"
                : type === "emoji"
                  ? "Emoji"
                  : "Image"
          } invalide`,
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content:
            type === "couleur"
              ? "La couleur doit être au format hexadécimal (#RRGGBB)."
              : type === "prix"
                ? "Le prix doit être un nombre valide."
                : type === "image"
                  ? "Le fichier doit être une image valide"
                  : type === "quantite"
                    ? 'La quantité doit être un nombre valide ou "-1" pour ne pas définir de quantité limite.'
                    : "Valeur invalide",
        },
      ],
    };

    return interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  await interaction.deferUpdate();

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  if (type === "image") {
    const response = await fetch(newValue.first().url);
    const buffer = Buffer.from(await response.arrayBuffer());

    const uploadDir = path.join(__dirname, "../../../data/images/articles");
    await fs.mkdir(uploadDir, { recursive: true });

    const extension = newValue.first().contentType.split("/")[1];
    const filePath = path.join(
      uploadDir,
      `article_${guildColor}_${boutiqueId}_${articleId}.${extension}`,
    );

    await fs.writeFile(filePath, buffer);
    newValue = filePath;
  }

  const boutiqueDatas = serverDatas.boutiques.find((p) => p.id === boutiqueId);
  const article = boutiqueDatas.article.find((g) => g.id === articleId);

  const modifDate = await toTimeStamp(new Date());

  const actionLabel =
    type === "couleur"
      ? "de la couleur"
      : type === "nom"
        ? "du nom"
        : type === "prix"
          ? "du prix"
          : type === "quantite"
            ? "de la quantité"
            : "de l'image";

  serverDatas.logs ??= [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: boutiqueId,
    action: `Modification ${actionLabel} de l'article ${article.nom} de ${article[type]} en ${newValue}`,
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

  article[type] = newValue;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const updatedContainer = await getBoutiqueEditArticleContainer(
    client,
    guildColor,
    article,
    serverDatas,
    boutiqueDatas,
  );

  return interaction.editReply({
    components: [updatedContainer],
    files: updatedContainer.files,
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "article_edit",
};
