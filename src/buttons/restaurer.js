const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { getConfigContainer } = require("../../components/containers");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const type = interaction.customId.split("-")[1];
  const panelId = Number(interaction.customId.split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);

  const panelIndex =
    type === "panel"
      ? serverDatas.panels.findIndex((x) => x.id === panelId)
      : serverDatas.boutiques.findIndex((x) => x.id === panelId);
  if (panelIndex === -1) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :warning: ${
            type === "panel" ? "Rôle-Play" : "Boutique"
          } Introuvable`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            type === "panel"
              ? "Ce rôle-play n'existe pas ou a déjà été supprimé."
              : "Cette boutique n'existe pas ou a déjà été supprimés.",
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

  const panelDatas =
    type === "panel"
      ? serverDatas.panels.find((x) => x.id === panelId)
      : serverDatas.boutiques.find((x) => x.id === panelId);
  panelDatas.delete = false;
  panelDatas.enable = true;

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    [type]: panelId,
    action: `Restauration ${
      type === "panel" ? "du rôle-play" : "de la boutique"
    } "${panelDatas.nom || panelDatas.name}"`,
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = Math.floor(Date.now() / 1000);

  await saveServerDatas(interaction, serverDatas, guildColor);

  const configContainer = await getConfigContainer(serverDatas, guildColor);

  await interaction.update({
    components: [configContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "restaurer",
};
