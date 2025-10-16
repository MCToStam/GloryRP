const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getConfigContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const guildColor = await getGuildColor(interaction);

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
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Ce rôle-play n'existe pas ou a déjà été supprimé.",
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

  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  panelDatas.delete = false;
  panelDatas.enable = true;

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: "Restauration du rôle-play",
  });

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = Math.floor(Date.now() / 1000);

  await saveServerDatas(interaction, serverDatas, guildColor);

  const configContainer = await getConfigContainer(serverDatas, guildColor);

  await interaction.update({
    components: [configContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "restore",
};

exports.conf = {
  type: "Button",
};
