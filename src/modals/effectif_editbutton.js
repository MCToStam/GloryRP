const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEffectifContainer } = require("../../components/containers.js");
const { updateEffectif } = require("../../utils/functions/effectif.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const buttonLabel = interaction.customId.split("-")[2];

  const new_label = interaction.fields.getTextInputValue("new_label");
  const new_link = interaction.fields.getTextInputValue("new_link");
  const notLink = !/^https?:\/\/.+/.test(new_link);

  if (notLink) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Lien non Valide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Le lien précisé n'est pas validé.",
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
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const button = panelDatas.effectif.button.find(
    (b) => b.label === buttonLabel,
  );

  const labelExists = panelDatas.effectif.button.some(
    (b) =>
      b.label.toLowerCase() === new_label.toLowerCase() &&
      b.label !== button.label,
  );

  if (labelExists) {
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
            "Ce nom est déjà utilisé par un autre bouton. Choisissez-en un autre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const modifDate = await toTimeStamp(new Date());

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification du bouton d'effectif ${button.label}`,
  });

  button.label = new_label;
  button.lien = new_link;

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEffectifContainer(
    panelId,
    guildColor,
    panelDatas,
  );
  await interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });

  await updateEffectif(client, guildColor, serverDatas, panelId);
};

exports.data = {
  name: "effectif_editbutton",
};
