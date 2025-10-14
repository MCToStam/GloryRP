const { getServerDatas, getGuildColor } = require("../../utils/functions/datas.js");
const { MessageFlags, ButtonStyle, SeparatorSpacingSize } = require("discord.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const guildColor = await getGuildColor(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

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
        content: `Supprimer le rôle-play **${panelDatas.name}** est irréversible et toutes les données stockées seront supprimées ! Êtes-vous sûr de vouloir continuer ?`,
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
                  custom_id: `delete_confirm-${panelId}-${guildColor}`,
                  label: 'Oui, Supprimer',
                  style: ButtonStyle.Danger,
              },
              {
                  type: 2,
                  custom_id: `delete_cancel-${panelId}`,
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
  name: "config_panel_delete",
};

exports.conf = {
  type: "Button",
};
