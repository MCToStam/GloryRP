const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const {
  getBoutiqueEditArticleContainer,
} = require("../../../components/containers.js");
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
  if (type === "prix") newValue = Number(newValue.replace(/\D/g, ""));
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
        { type: 14, spacing: SeparatorSpacingSize.Large },
        {
          type: 10,
          content:
            type === "couleur"
              ? "La couleur doit être au format hexadécimal (#RRGGBB)."
              : type === "prix"
                ? "Le prix doit être un nombre valide."
                : type === "image"
                  ? "Le fichier doit être une image valide"
                  : "Valeur invalide",
        },
      ],
    };

    return interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
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
        : type === "emoji"
          ? "de l'émoji"
          : "de l'image";

  serverDatas.logs ??= [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: boutiqueId,
    action: `Modification ${actionLabel} de l'article ${article.nom} de ${article[type]} en ${newValue}`,
  });

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
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "article_edit",
};
