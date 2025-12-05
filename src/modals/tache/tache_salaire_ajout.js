const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { discordLink } = require("../../../utils/functions/linkedUser.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const {
  getJoueurTacheContainer,
} = require("../../../components/salaireContainer.js");

exports.run = async (client, interaction, config) => {
  const [_, type, joueur, panelId, serv, mois] =
    interaction.customId.split("-");

  const argent = interaction.fields.getTextInputValue("argent");
  const motif = interaction.fields.getTextInputValue("motif");

  const salaireNumber = Number(argent.replace(/\./g, ""));
  if (isNaN(salaireNumber)) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: ${
            type.charAt(0).toUpperCase() + type.slice(1)
          } non Valide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: `Le ${type} doit être un nombre.`,
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
  const panelDatas = serverDatas.panels.find((x) => x.id === Number(panelId));

  panelDatas.salaire.salaire[joueur][mois].taches.push({
    nom: motif,
    emoji: false,
    lien: false,
    details: false,
    timestamp: Date.now(),
    status: type,
    staff: await discordLink(interaction.user.id),
    argent: salaireNumber,
    messageId: false,
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const { error, component: salaireContainer } = await getJoueurTacheContainer(
    client,
    joueur,
    serverDatas,
    panelId,
    serv,
    mois,
  );

  return interaction.update({
    components: [salaireContainer],
  });
};

exports.data = {
  name: "salaire_tache_ajout",
};
