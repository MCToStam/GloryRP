const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiqueEditReductionContainer,
} = require("../../../components/containers");
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
  const code = interaction.fields.getTextInputValue("code");
  const debut = interaction.fields.getTextInputValue("debut");
  const fin = interaction.fields.getTextInputValue("fin");
  const boutiqueId = Number(interaction.customId.split("-")[1]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutique = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const nameExists = boutique.reduction.some(
    (r) => r.code.toLowerCase() === code.toLowerCase(),
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
            "Ce code est déjà utilisé par une autre réduction, veuillez en choisir un autre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const debutTimestamp = parseFrenchDateToDiscordTimestamp(debut);
  const finTimestamp = parseFrenchDateToDiscordTimestamp(fin);

  if (!debutTimestamp || !finTimestamp) {
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
          spacing: 2,
        },
        {
          type: 10,
          content:
            'Les dates de début et de fin doivent être au format "JJ/MM/AAAA HHhMM", soit par exemple "14/12/2025 15h00".',
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (debutTimestamp > finTimestamp) {
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
          spacing: 2,
        },
        {
          type: 10,
          content: "La date de fin doit être après la date de début.",
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
    "..",
    "data",
    "reductionBaseData.json",
  );
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf8"));

  if (!boutique.reduction) boutique.reduction = [];

  let newId = 1;
  const existingIds = boutique.reduction.map((p) => p.id);
  while (existingIds.includes(newId)) {
    newId++;
  }

  const newReduction = JSON.parse(JSON.stringify(baseData));

  newReduction.id = newId;
  newReduction.code = code;
  newReduction.debut = debutTimestamp;
  newReduction.fin = finTimestamp;
  boutique.timestamp = modifDate;
  boutique.lastUser = interaction.user.id;

  boutique.reduction.push(newReduction);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: newId,
    action: `Création de la réduction ${code}`,
  });

  serverDatas.timestamp = modifDate;
  serverDatas.lastUser = interaction.user.id;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getBoutiqueEditReductionContainer(
    client,
    guildColor,
    newReduction,
    boutique,
  );

  return interaction.update({
    components: [goodContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "reduction_create",
};
