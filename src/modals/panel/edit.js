const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditPanelContainer } = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const [_, action, panelIdStr] = interaction.customId.split("-");
  const panelId = Number(panelIdStr);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  let fieldValue = interaction.fields.getTextInputValue(action) || false;
  let logAction = "";

  switch (action) {
    case "description":
      logAction = "Édition de la description du rôle-play";
      break;

    case "emoji":
      logAction = "Édition de l'émoji du rôle-play";
      break;

    case "name":
      const nameExists = serverDatas.panels.some(
        (p) =>
          p.id !== panelId && p.name.toLowerCase() === fieldValue.toLowerCase(),
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
                "Ce nom est déjà utilisé par un autre rôle-play, veuillez en choisir un autre.",
            },
          ],
        };

        return interaction.reply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          allowedMentions: { parse: [] },
        });
      }

      logAction = "Renommage du rôle-play";
      break;

    default:
      return interaction.reply({
        content: "❌ Action inconnue.",
        ephemeral: true,
      });
  }

  panelDatas[action] = fieldValue;

  const modifDate = await toTimeStamp(new Date());
  if (!serverDatas.logs) serverDatas.logs = [];

  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: logAction,
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEditPanelContainer(
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
  name: "panel_edit",
};
