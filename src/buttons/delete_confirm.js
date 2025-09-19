const fs = require("node:fs");
const path = require("node:path");
const { getServerDatas } = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getConfigContainer } = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const guildColor = interaction.customId.split("-")[2];

  const serverDatas = await getServerDatas(interaction, guildColor);

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
    await interaction.message.delete().catch(() => {});
  }

  serverDatas.panels.splice(panelIndex, 1);

  serverDatas.logs = serverDatas.logs.filter((log) => log.panel !== panelId);

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = Math.floor(Date.now() / 1000);

  const panelPath = path.join(
    __dirname,
    `../../data/servers/${guildColor}.json`
  );
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2));

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
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content:
          "Le rôle-play a correctement été supprimé ainsi que toutes les données correspondantes.",
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
      interaction.message.id
    );
    if (msg) await msg.delete().catch(() => {});
  }, 5000);

  const repliedMessageId = interaction.message.reference?.messageId;
  if (repliedMessageId) {
    const originalMessage = await interaction.channel.messages.fetch(
      repliedMessageId
    );
    const configContainer = await getConfigContainer(serverDatas, guildColor);
    await originalMessage.edit({
      components: [configContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "delete_confirm",
};

exports.conf = {
  type: "Button",
};
