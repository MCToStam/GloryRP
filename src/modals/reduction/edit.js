const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const {
  getBoutiqueEditReductionContainer,
} = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

function parseFrenchDateToDiscordTimestamp(dateStr) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})h(\d{2})$/;
  const match = dateStr.match(regex);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  const date = new Date(year, month - 1, day, hour, minute);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return Math.floor(date.getTime() / 1000);
}

exports.run = async (client, interaction, config) => {
  const [_, boutiqueIdStr, reductionIdStr, type] =
    interaction.customId.split("-");
  const boutiqueId = Number(boutiqueIdStr);
  const reductionId = Number(reductionIdStr);

  let newValue = interaction.fields.getTextInputValue(type);
  if (type === "usemax")
    newValue = Number(newValue.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, ""));

  if (type === "debut" || type === "fin")
    newValue = parseFrenchDateToDiscordTimestamp(newValue);

  if (!newValue) {
    const texte =
      newValue === "usemax"
        ? `${
            type === "usemax" ? "L'utilisation maximale" : "La valeur"
          } doit être un nombre valide.`
        : 'Les dates de début et de fin doivent être au format "JJ/MM/AAAA HHhMM", soit par exemple "14/12/2025 15h00".';
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: ${
            newValue === "usemax" ? "Utilisation Maximale" : "Date"
          } Invalide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: texte,
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  await interaction.deferUpdate();

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  const boutiqueDatas = serverDatas.boutiques.find((p) => p.id === boutiqueId);
  const reduction = boutiqueDatas.reduction.find((g) => g.id === reductionId);

  const modifDate = await toTimeStamp(new Date());

  const actionLabel =
    type === "debut"
      ? "du début"
      : type === "fin"
        ? "de la fin"
        : type === "code"
          ? "du code"
          : type === "usemax"
            ? "de l'utilisation maximale"
            : "de la valeur";

  serverDatas.logs ??= [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: boutiqueId,
    action: `Modification ${actionLabel} de la réduction ${reduction.code} de ${reduction[type]} en ${newValue}`,
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

  reduction[type] = newValue;

  if (reduction.debut > reduction.fin) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Date Invalide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "La date de fin doit être après la date de début.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  await saveServerDatas(interaction, serverDatas, guildColor);

  const updatedContainer = await getBoutiqueEditReductionContainer(
    client,
    guildColor,
    reduction,
    boutiqueDatas,
  );

  return interaction.editReply({
    components: [updatedContainer],
    files: updatedContainer.files,
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "reduction_edit",
};
