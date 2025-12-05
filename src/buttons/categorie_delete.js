const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const {
  MessageFlags,
  ButtonStyle,
  SeparatorSpacingSize,
} = require("discord.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const categorieId = Number(interaction.customId.split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const categorie = boutiqueDatas.categorie.find((c) => c.id === categorieId);

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
        content: `Supprimer la catégorie **${categorie.nom}** est irréversible et toutes les données stockées seront supprimées, comprenant aussi tous les articles associés ! Êtes-vous sûr de vouloir continuer ?`,
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
            custom_id: `categorie_delete_confirm-${categorie.id}-${boutiqueId}-${guildColor}`,
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
};

exports.data = {
  name: "categorie_delete",
};
