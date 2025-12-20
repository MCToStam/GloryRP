const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const {
  getBoutiqueCategorieContainer,
} = require("../../components/containers");
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
  const categorieId = Number(interaction.customId.split("-")[1]);

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
          spacing: 2,
        },
        {
          type: 10,
          content: "La couleur doit être au format hexadecimal.",
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
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const categorie = boutiqueDatas.categorie.find((c) => c.id === categorieId);

  const nameExists = boutiqueDatas.categorie.some(
    (c) => c.nom.toLowerCase() === nom.toLowerCase(),
  );
  if (nameExists && nom !== categorie.nom) {
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
            "Ce nom est déjà utilisé par une autre catégorie, veuillez en choisir un autre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  await interaction.deferUpdate({});

  const modifDate = await toTimeStamp(new Date());

  if (!boutiqueDatas.categorie) boutiqueDatas.categorie = [];

  categorie.nom = nom;
  categorie.couleur = couleur;

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    boutique: boutiqueId,
    action: `Modification de la catégorie ${nom}`,
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

  return interaction.editReply({
    components: [goodContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "edit_categorie",
};
