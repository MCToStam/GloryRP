const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiqueCategorieContainer,
} = require("../../../components/containers");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const categorieId = Number(interaction.customId.split("-")[2]);
  const guildColor =
    interaction.customId.split("-")[3] || (await getGuildColor(interaction));
  const confirm = interaction.customId.split("-")[4];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const categorie = boutiqueDatas.categorie.find((c) => c.id === categorieId);

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
          content: `Supprimer la catégorie **${categorie.nom}** est irréversible et toutes les données stockées seront supprimées, comprenant aussi tous les articles associés ! Êtes-vous sûr de vouloir continuer ?`,
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
              custom_id: `categorie_delete-${categorie.id}-${boutiqueId}-${guildColor}-confirm`,
              label: "Oui, Supprimer",
              style: 4,
            },
            {
              type: 2,
              custom_id: `delete_cancel`,
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
    const panelIndex = boutiqueDatas.categorie.findIndex(
      (c) => c.id === categorieId,
    );
    if (panelIndex === -1) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## :warning: Catégorie Introuvable`,
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content: "Cette catégorie n'existe pas ou a déjà été supprimé.",
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

    const modifDate = await toTimeStamp(new Date());

    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      boutique: boutiqueId,
      action: `Suppression de la catégorie ${categorie.nom}`,
    });

    boutiqueDatas.categorie.splice(panelIndex, 1);

    if (Array.isArray(boutiqueDatas.article)) {
      boutiqueDatas.article = boutiqueDatas.article.filter(
        (a) => a.categorieId !== categorieId,
      );
    }

    serverDatas.lastUser = interaction.user.id;
    serverDatas.timestamp = Math.floor(Date.now() / 1000);

    await saveServerDatas(interaction, serverDatas, guildColor);

    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        {
          type: 10,
          content: `## :white_check_mark: Catégorie Supprimé`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            "La catégorie a correctement été supprimé ainsi que toutes les données correspondantes, comprenant aussi tous les articles associés.",
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
      const configContainer = await getBoutiqueCategorieContainer(
        client,
        boutiqueId,
        guildColor,
        boutiqueDatas,
      );
      await originalMessage.edit({
        components: [configContainer],
        flags: 32768,
        allowedMentions: { parse: [] },
      });
    }
  }
};

exports.data = {
  name: "categorie_delete",
};
