const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditGradeContainer } = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

function formatHexColor(input) {
  const color = input.startsWith("#")
    ? input.toUpperCase()
    : "#" + input.toUpperCase();

  return /^#[0-9A-F]{6}$/.test(color) ? color : null;
}

exports.run = async (client, interaction, config) => {
  const [_, panelIdStr, gradeIdStr, type] = interaction.customId.split("-");
  const panelId = Number(panelIdStr);
  const gradeId = Number(gradeIdStr);

  let newValue = interaction.fields.getTextInputValue(type);
  if (type === "couleur") newValue = formatHexColor(newValue);

  if (!newValue) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: ${
            type === "couleur" ? "Couleur" : "Nom"
          } invalide`,
        },
        { type: 14, spacing: SeparatorSpacingSize.Large },
        {
          type: 10,
          content:
            type === "couleur"
              ? "La couleur doit être au format hexadécimal (#RRGGBB)."
              : "Valeur invalide.",
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

  const panelDatas = serverDatas.panels.find((p) => p.id === panelId);
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

  const modifDate = await toTimeStamp(new Date());

  const actionLabel = type === "couleur" ? "de la couleur" : "du nom";

  serverDatas.logs ??= [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification ${actionLabel} du grade ${grade.nom} de ${grade[type]} en ${newValue}`,
  });

  grade[type] = newValue;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const updatedContainer = await getEditGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    gradeId,
  );

  return interaction.editReply({
    components: [updatedContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "grade_edit",
};
