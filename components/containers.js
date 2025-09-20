const config = require("../config.js");
const {
  SeparatorSpacingSize,
  ButtonStyle,
  ChannelType,
  time,
  userMention,
} = require("discord.js");
const { getPanelsSelecString } = require("./selectsString.js");

async function getConfigContainer(serverDatas, serv) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelsComponents = serverDatas.panels.map((panel) => ({
    type: 9,
    components: [
      {
        type: 10,
        content: `${panel.emoji} Panel ${panel.name}`,
      },
    ],
    accessory: {
      type: 2,
      custom_id: `toggle-panel-${panel.id}-acceuil`,
      label: panel.enable ? "Activé" : "Désactivé",
      emoji: { name: panel.enable ? "✅" : "❌" },
      style: panel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
    },
  }));

  return {
    type: 17,
    accent_color: config.couleur[serv],
    components: [
      {
        type: 10,
        content: "## :gear: Configuration du Role-Play " + servName,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      ...panelsComponents,
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [await getPanelsSelecString(serverDatas)],
      },
      {
        type: 10,
        content:
          "-# Dernières modifications par " +
          userMention(serverDatas.lastUser) +
          " " +
          (await time(serverDatas.timestamp, "R")),
      },
    ],
  };
}

async function getPanelContainer(guildColor, panelDatas, panelId) {
  return panelContainer = {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${panelDatas.emoji ? `${panelDatas.emoji} ` : ""}Configuration du Rôle-Play ${panelDatas.name}`,
      },
      {
        type: 14,
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
          custom_id: `toggle-panel-${panelId}-panel`,
          label: panelDatas.enable ? "Activé" : "Désactivé",
          emoji: { name: panelDatas.enable ? "✅" : "❌" },
          style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
        },
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
          type: 1,
          components: [
              {
                  type: 2,
                  custom_id: `config_channel-${panelId}`,
                  label: 'Configurer les Salons',
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_grade-${panelId}`,
                  label: "Configurer les Grades",
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_tache-${panelId}`,
                  label: 'Configurer les Tâches',
                  style: ButtonStyle.Primary,
              },
          ],
      },
      {
          type: 1,
          components: [
              {
                  type: 2,
                  custom_id: `config_panel-${panelId}`,
                  label: 'Configurer le Panel',
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_salaire-${panelId}`,
                  label: "Configurer les Salaires",
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_boutique-${panelId}`,
                  label: 'Configurer la Boutique',
                  style: ButtonStyle.Secondary,
                  disabled: true,
              },
          ],
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
          type: 1,
          components: [
              {
                  type: 2,
                  custom_id: `return`,
                  label: "🚪 Retour à l'Acceuil",
                  style: ButtonStyle.Secondary,
              },
          ],
      },
    ],
  };
}

async function getChannelContainer(panelId, guildColor, panelDatas) {
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
              : "Il te faut d'abord activer un rôle-play",
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
    );
  }

  return {
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
          custom_id: `toggle-panel-${panelId}-channel`,
          label: panelDatas.enable ? "Activé" : "Désactivé",
          emoji: { name: panelDatas.enable ? "✅" : "❌" },
          style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
        },
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      ...channelsOptions,
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}`,
            label: "🚪 Retour",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `send_panel-${panelId}`,
            label: "💲 Envoyer le panel de tâche",
            style: ButtonStyle.Primary,
            disabled: panelDatas.channels.tasks && panelDatas.enable ? false : true,
          },
          {
            type: 2,
            custom_id: `send_effectif-${panelId}`,
            label: "👥 Envoyer l'effectif",
            style: ButtonStyle.Primary,
            disabled: panelDatas.channels.effectif && panelDatas.enable ? false : true,
          },
        ],
      },
    ],
  }
}

async function getSalaireContainer(panelId, guildColor, panelDatas) {
  return {
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
          custom_id: `toggle-panel-${panelId}-salaire`,
          label: panelDatas.enable ? "Activé" : "Désactivé",
          emoji: { name: panelDatas.enable ? "✅" : "❌" },
          style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
        },
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `config_salaire-${panelId}-automatique`,
            placeholder: "Choisis une option...",
            disabled: panelDatas.enable ? false : true,
            options: [
              {
                label: "Oui",
                value: `config_salaire-${panelId}-automatique-oui`,
                description: "Les salaires seront automatiquement envoyé le premier de chaque mois à 10h00",
                emoji: { name: "✅" },
                default: panelDatas.salaire.automatique === true,
              },
              {
                label: "Non",
                value: `config_salaire-${panelId}-automatique-non`,
                description: "Les salaires pourront être envoyées manuellement",
                emoji: { name: "❌" },
                default: panelDatas.salaire.automatique === false,
              },
            ],
          },
        ],
      },
			{
				type: 9,
				components: [
					{
						type: 10,
						content: "Modifier les commandes de retrait et don d'argent lors des salaires",
					},
				],
				accessory: {
					type: 2,
					custom_id: `cmd_salaire-${panelId}-commande`,
					label: "🔧 Modifier les commandes",
					style: ButtonStyle.Primary,
          disabled: panelDatas.enable ? false : true,
				},
			},
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}`,
            label: "🚪 Retour",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `salairePost-${panelId}`,
            label: "💰 Envoyer les Salaires",
            style: ButtonStyle.Primary,
            disabled: panelDatas.channels.salaire && panelDatas.enable ? false : true,
          },
        ],
      },
    ],
  }
}

async function getEditPanelContainer(panelId, guildColor, panelDatas) {
  return {
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
          custom_id: `toggle-panel-${panelId}-edit_panel`,
          label: panelDatas.enable ? "Activé" : "Désactivé",
          emoji: { name: panelDatas.enable ? "✅" : "❌" },
          style: panelDatas.enable ? ButtonStyle.Success : ButtonStyle.Danger,
        },
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
          type: 1,
          components: [
              {
                  type: 2,
                  custom_id: `config_panel_rename-${panelId}`,
                  label: 'Renommer le Rôle-Play',
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_panel_emoji-${panelId}`,
                  label: "Modifier l'Emoji",
                  style: ButtonStyle.Primary,
              },
              {
                  type: 2,
                  custom_id: `config_panel_delete-${panelId}`,
                  label: 'Supprimer le Rôle-Play',
                  style: ButtonStyle.Danger,
              },
          ],
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}`,
            label: "🚪 Retour",
            style: ButtonStyle.Secondary,
          },
        ],
      },
    ],
  }
}

module.exports = { getConfigContainer, getPanelContainer, getChannelContainer, getSalaireContainer, getEditPanelContainer };
