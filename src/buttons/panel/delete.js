const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const guildColor =
    interaction.customId.split("-")[2] || (await getGuildColor(interaction));
  const confirm = interaction.customId.split("-")[3];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  if (!confirm) {
    const deleteContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :warning: Action Irréversible`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content: `Supprimer le rôle-play **${panelDatas.name}** est irréversible et toutes les données stockées seront supprimées ! Êtes-vous sûr de vouloir continuer ?`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `panel_delete-${panelId}-${guildColor}-confirm`,
              label: "Oui, Supprimer",
              style: 4,
            },
            {
              type: 2,
              custom_id: `delete_cancel-${panelId}`,
              label: "Annuler",
              style: 3,
            },
          ],
        },
      ],
    };

    await interaction.reply({
      components: [deleteContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } else {
    const panelIndex = serverDatas.panels.findIndex((x) => x.id === panelId);
    if (panelIndex === -1) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## :warning: Rôle-Play Introuvable`,
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content: "Ce rôle-play n'existe pas ou a déjà été supprimé.",
          },
        ],
      };

      await interaction.reply({
        components: [errorContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
      return await interaction.message.delete().catch(() => {});
    }

    const now = new Date();
    const modifDate = await toTimeStamp(now);
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureTimeStampDate = await toTimeStamp(futureDate);

    panelDatas.delete = futureTimeStampDate;
    panelDatas.enable = false;

    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      panel: panelId,
      action: "Suppression du rôle-play",
    });

    serverDatas.lastUser = interaction.user.id;
    serverDatas.timestamp = Math.floor(Date.now() / 1000);

    await saveServerDatas(interaction, serverDatas, guildColor);

    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        {
          type: 10,
          content: `## :white_check_mark: Rôle-Play Supprimé`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            "Le rôle-play sera correctement supprimé dans exactement 7 jours. Tu pourras donc pendant cette durée restaurer le rôle-play si tu souhaites revenir sur ton choix.",
        },
      ],
    };

    await interaction.update({
      components: [goodContainer],
      flags: 32768,
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
      const configContainer = await getConfigContainer(serverDatas, guildColor);
      await originalMessage.edit({
        components: [configContainer],
        flags: 32768,
        allowedMentions: { parse: [] },
      });
    }
  }
};

exports.data = {
  name: "panel_delete",
};
