const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiqueReductionContainer,
} = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");
const {
  MessageFlags,
  ButtonStyle,
  SeparatorSpacingSize,
} = require("discord.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const reductionId = Number(interaction.customId.split("-")[2]);
  const guildColor =
    interaction.customId.split("-")[3] || (await getGuildColor(interaction));
  const confirm = interaction.customId.split("-")[4];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const reduction = boutiqueDatas.reduction.find((r) => r.id === reductionId);

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
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Supprimer la réduction **${reduction.code}** est irréversible et toutes les données stockées seront supprimées ! Êtes-vous sûr de vouloir continuer ?`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `reduction_delete-${boutiqueId}-${reduction.id}-${guildColor}-confirm`,
              label: "Oui, Supprimer",
              style: ButtonStyle.Danger,
            },
            {
              type: 2,
              custom_id: `delete_cancel`,
              label: "Annuler",
              style: ButtonStyle.Success,
            },
          ],
        },
      ],
    };

    await interaction.reply({
      components: [deleteContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  } else {
    const panelIndex = boutiqueDatas.reduction.findIndex(
      (r) => r.id === reductionId,
    );
    if (panelIndex === -1) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## :warning: Réduction Introuvable`,
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: "Cette réduction n'existe pas ou a déjà été supprimé.",
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

    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      boutique: boutiqueId,
      action: `Suppression de la réduction ${reduction.code}`,
    });

    boutiqueDatas.reduction.splice(panelIndex, 1);

    serverDatas.lastUser = interaction.user.id;
    serverDatas.timestamp = Math.floor(Date.now() / 1000);

    await saveServerDatas(interaction, serverDatas, guildColor);

    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        {
          type: 10,
          content: `## :white_check_mark: Réduction Supprimé`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content:
            "La réduction a correctement été supprimée ainsi que toutes les données correspondantes.",
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
      const configContainer = await getBoutiqueReductionContainer(
        boutiqueId,
        guildColor,
        boutiqueDatas,
        1,
      );
      await originalMessage.edit({
        components: [configContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    }
  }
};

exports.data = {
  name: "reduction_delete",
};
