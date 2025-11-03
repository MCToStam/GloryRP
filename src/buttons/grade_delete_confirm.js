const {
  getServerDatas,
  saveServerDatas,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getGradeContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);
  const gradeId = Number(interaction.customId.split("-")[1]);
  const guildColor = interaction.customId.split("-")[3];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const panelIndex = panelDatas.grade.findIndex((x) => x.gradeId === gradeId);
  if (panelIndex === -1) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :warning: Grade Introuvable`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Ce grade n'existe pas ou a déjà été supprimé.",
        },
      ],
    };

    await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
    return await interaction.message.delete().catch(() => {});
  }

  const modifDate = await toTimeStamp(new Date());
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Suppression du grade ${grade.nom}`,
  });

  panelDatas.grade.splice(panelIndex, 1);

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = Math.floor(Date.now() / 1000);

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
      {
        type: 10,
        content: `## :white_check_mark: Grade Supprimé`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content:
          "Le grade a correctement été supprimé ainsi que toutes les données correspondantes.",
      },
    ],
  };

  await interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });

  setTimeout(async () => {
    const msg = await interaction.channel.messages.fetch(
      interaction.message.id,
    );
    if (msg) await msg.delete().catch(() => {});
  }, 5000);

  const repliedMessageId = interaction.message.reference?.messageId;
  if (repliedMessageId) {
    const originalMessage =
      await interaction.channel.messages.fetch(repliedMessageId);
    const configContainer = await getGradeContainer(
      client,
      panelId,
      guildColor,
      panelDatas,
    );
    await originalMessage.edit({
      components: [configContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "grade_delete_confirm",
};

exports.conf = {
  type: "User",
};
