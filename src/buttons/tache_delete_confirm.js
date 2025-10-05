const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
} = require("../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getTacheContainer } = require("../../components/containers.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);
  const tacheId = Number(interaction.customId.split("-")[1]);
  const guildColor = interaction.customId.split("-")[3];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const panelIndex = panelDatas.tasks.findIndex(
    (x) => x.taskId === tacheId
  );
  if (panelIndex === -1) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :warning: Tâche Introuvable`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Cette tâche n'existe pas ou a déjà été supprimé.",
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
  const tache = panelDatas.tasks.find((t) => t.taskId === tacheId);

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Suppression de la tâche ${tache.name}`,
  });

  panelDatas.tasks.splice(panelIndex, 1);

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
        content: `## :white_check_mark: Tâche Supprimé`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content:
          "La tâche a correctement été supprimée ainsi que toutes les données correspondantes.",
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
    const configContainer = await getTacheContainer(
      client,
      panelId,
      guildColor,
      panelDatas
    );
    await originalMessage.edit({
      components: [configContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "tache_delete_confirm",
};

exports.conf = {
  type: "Button",
};