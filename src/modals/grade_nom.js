const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditGradeContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const gradeId = Number(interaction.customId.split("-")[2]);

  const new_name = interaction.fields.getTextInputValue("new_name");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

  const nameExists = panelDatas.grade.some(
    (g) =>
      g.gradeId !== gradeId && g.nom.toLowerCase() === new_name.toLowerCase(),
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

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Renommmage du grade ${grade.nom} en ${new_name}`,
  });

  grade.nom = new_name;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEditGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    gradeId,
  );
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "edit_grade_nom",
};
