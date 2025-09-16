const {
  ChannelType,
  SeparatorSpacingSize,
  ButtonStyle,
  time,
  userMention,
} = require("discord.js");
const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const panelId = Number(interaction.values[0].split("-")[2]);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const channelsOptions = [];

  for (const [channelType, channelId] of Object.entries(panelDatas.channels)) {
    const channelDesc = config.channels[channelType];

    channelsOptions.push(
      {
        type: 10,
        content: channelDesc,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-${channelType}`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Active d'abord le panel",
            max_values: 1,
            disabled: panelDatas.enable ? false : true,
            channel_types: [ChannelType.GuildText],
            default_values: [
              panelDatas.enable && channelId
                ? {
                    type: "channel",
                    id: channelId,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      channelType === "tasks"
        ? {
            type: 10,
            content:
              "-# Dernières modifications par " +
              userMention(panelDatas.lastUser) +
              " " +
              (await time(panelDatas.timestamp, "R")),
          }
        : {
            type: 14,
            spacing: SeparatorSpacingSize.Small,
          }
    );
  }

  const panelContainer = {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${panelDatas.emoji} Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 14,
        divider: false,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: "📡 Statut",
          },
        ],
        accessory: {
          type: 2,
          custom_id: "toggle-panel-" + panelId,
          label: panelDatas.enable ? "Activé" : "Désactivé",
          emoji: { name: panelDatas.enable ? "✅" : "❌" },
          style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
        },
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
    ].concat(channelsOptions),
  };
  const configHome = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: "return-config-home",
        label: "Accueil",
        emoji: { name: "🏡" },
        style: ButtonStyle.Primary,
      },
      panelDatas.channels.tasks
        ? {
            type: 2,
            custom_id: "send-panel-" + panelId,
            label: "Envoyer",
            emoji: { name: "📨" },
            style: ButtonStyle.Secondary,
            disabled: panelDatas.enable ? false : true,
          }
        : undefined,
    ].filter(Boolean),
  };
  await interaction.message.edit({
    components: [panelContainer, configHome],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "config" };
