const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getCandidatureContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const new_lien = interaction.fields.getTextInputValue("new_lien");

  if (!new_lien.startsWith("https://nationsglory.fr/forums/thread")) {
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
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            'Le lien doit être une discussion du forum de NationsGlory, donc commençant par l\'URL "https://nationsglory.fr/forums/thread".',
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

  panelDatas.candidature.lien = new_lien;
  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Édition du lien forum de candidature",
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getCandidatureContainer(
    panelId,
    guildColor,
    panelDatas,
  );
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config_candidature_lien",
};
