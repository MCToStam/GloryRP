const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditGradeContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

function formatHexColor(input) {
  let color = input.toUpperCase();
  if (!color.startsWith("#")) color = "#" + color;
  if (!/^#[0-9A-F]{6}$/.test(color)) return null;
  return color;
}

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const gradeId = Number(interaction.customId.split("-")[2]);

  const new_color = formatHexColor(interaction.fields.getTextInputValue("new_color"));

  if (!new_color) {
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
          content:
            "La couleur doit être au format hexadecimal.",
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
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification de la couleur du grade ${grade.nom} de ${grade.couleur} en ${grade.new_color}`,
  });

  grade.couleur = new_color;

  const panelPath = path.join(
    __dirname,
    `../../data/servers/${guildColor}.json`
  );
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2), "utf8");

  const goodContainer = await getEditGradeContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    gradeId
  );
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "edit_grade_couleur",
};