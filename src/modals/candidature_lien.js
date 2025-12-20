const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { getCandidatureContainer } = require("../../components/containers");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const new_lien = interaction.fields.getTextInputValue("new_lien");

  if (!new_lien.startsWith("https://nationsglory.fr/forums/category")) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Lien Invalide`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            'Le lien doit être une discussion du forum de NationsGlory, donc commençant par l\'URL "https://nationsglory.fr/forums/category".',
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
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.candidature.lien = new_lien;
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Édition du lien forum de candidature",
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getCandidatureContainer(
    panelId,
    guildColor,
    panelDatas,
  );
  return interaction.update({
    components: [goodContainer],
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config_candidature_lien",
};
