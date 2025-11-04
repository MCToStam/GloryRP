const config = require("../config.js");
const {
  SeparatorSpacingSize,
  ButtonStyle,
  ChannelType,
  time,
  userMention,
} = require("discord.js");
const { getPanelsSelecString } = require("./selectsString.js");
const { getHexEmoji } = require("../utils/functions/emojis.js");

async function getConfigContainer(serverDatas, serv) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  let panelsComponents = [];

  if (serverDatas.panels.length === 0) {
    panelsComponents.push({
      type: 10,
      content: "Aucun panel configuré pour le moment.",
    });
  } else {
    panelsComponents = serverDatas.panels.map((panel) => ({
      type: 9,
      components: [
        {
          type: 10,
          content: `${panel.emoji ? `${panel.emoji} ` : ""}Panel ${
            panel.name
          } ${
            panel.delete
              ? `\n*Suppression définitive dans <t:${panel.delete}:R> !*`
              : ""
          }`,
        },
      ],
      accessory: panel.delete
        ? {
            type: 2,
            custom_id: `restore-panel-${panel.id}`,
            label: "Restaurer",
            emoji: { name: "♻️" },
            style: ButtonStyle.Primary,
          }
        : {
            type: 2,
            custom_id: `toggle-panel-${panel.id}-acceuil`,
            label: panel.enable ? "Activé" : "Désactivé",
            emoji: { name: panel.enable ? "✅" : "❌" },
            style: panel.enable ? ButtonStyle.Success : ButtonStyle.Danger,
          },
    }));
  }

  const returnComponent = {
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
    ],
  };

  if (serverDatas.lastUser && serverDatas.timestamp) {
    returnComponent.components.push({
      type: 10,
      content:
        "-# Dernières modifications par " +
        userMention(serverDatas.lastUser) +
        " " +
        (await time(serverDatas.timestamp, "R")),
    });
  }

  return returnComponent;
}

async function getPanelContainer(guildColor, panelDatas, panelId) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        }Configuration du Rôle-Play ${panelDatas.name}`,
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
            label: "Configurer les Salons",
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
            label: "Configurer les Tâches",
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
            label: "Configurer le Panel",
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
            label: "Configurer la Boutique",
            style: ButtonStyle.Secondary,
            disabled: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config_depotdeplainte-${panelId}`,
            label: "Configurer le Dépot de Plainte",
            style: ButtonStyle.Primary,
          },
          {
            type: 2,
            custom_id: `config_candidature-${panelId}`,
            label: "Configurer les Candidature",
            style: ButtonStyle.Primary,
          },
          {
            type: 2,
            custom_id: `config_effectif-${panelId}`,
            label: "Configurer l'Effectif",
            style: ButtonStyle.Primary,
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
            custom_id: "return",
            label: "🚪 Retour à l'Acceuil",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `show_logs-${panelId}`,
            label: "📜 Afficher les Logs",
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
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ],
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
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
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
            disabled:
              panelDatas.channels.tasks && panelDatas.enable ? false : true,
          },
          {
            type: 2,
            custom_id: `send_effectif-${panelId}`,
            label: "👥 Envoyer l'effectif",
            style: ButtonStyle.Primary,
            disabled:
              panelDatas.channels.effectif && panelDatas.enable ? false : true,
          },
        ],
      },
    ],
  };
}

async function getSalaireContainer(panelId, guildColor, panelDatas) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 10,
        content: `**Salon où sera envoyé les salaires :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-salaire-salaire`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Il te faut d'abord activer un rôle-play",
            max_values: 1,
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ],
            default_values: [
              panelDatas.enable && panelDatas.channels.salaire
                ? {
                    type: "channel",
                    id: panelDatas.channels.salaire,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      {
        type: 10,
        content: `**Salon où sera envoyé les commandes à effectuer :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-cmd_salaire-salaire`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Il te faut d'abord activer un rôle-play",
            max_values: 1,
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ],
            default_values: [
              panelDatas.enable && panelDatas.channels.cmd_salaire
                ? {
                    type: "channel",
                    id: panelDatas.channels.cmd_salaire,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      {
        type: 10,
        content: `**Rôle mentionné lors de l'envoie des salaires :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 6,
            custom_id: `config-${panelId}-role-salaire`,
            placeholder: "Sélectionne un rôle...",
            min_values: 0,
            max_values: 25,
            default_values:
              panelDatas.roles.salaire?.map((r) => ({
                id: r,
                type: "role",
              })) || [],
          },
        ],
      },
      {
        type: 10,
        content: `**Envoyer ou non automatiquement les salaires :**`,
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
                description:
                  "Les salaires seront automatiquement envoyé le premier de chaque mois à 10h00",
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
            content:
              "Modifier les commandes de retrait et don d'argent lors des salaires",
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
            custom_id: "aide-salaire",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `salairePost-${panelId}`,
            label: "💰 Envoyer les Salaires",
            style: ButtonStyle.Primary,
            disabled:
              panelDatas.channels.salaire && panelDatas.enable ? false : true,
          },
        ],
      },
    ],
  };
}

async function getEditGradeContainer(
  client,
  panelId,
  guildColor,
  panelDatas,
  gradeId,
) {
  const grade = panelDatas.grade.find((g) => g.gradeId === gradeId);

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 9,
        components: [{ type: 10, content: `**Nom :** ${grade.nom}` }],
        accessory: {
          type: 2,
          custom_id: `edit_grade_nom-${panelId}-${gradeId}`,
          label: "⚙️ Modifier le Nom",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Couleur :** ${
              grade.couleur
                ? `${await getHexEmoji(client, grade.couleur)} (${
                    grade.couleur
                  }) `
                : "Aucune couleur configurée"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_grade_couleur-${panelId}-${gradeId}`,
          label: "🎨 Modifier la Couleur",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 10,
        content: `**Tier du grade :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `edit_grade_tier-${panelId}-${gradeId}`,
            placeholder: "Choisis un Tier...",
            options: [
              ...[5, 4, 3, 2, 1].map((tier) => ({
                label: `Tier ${tier}`,
                value: `edit_grade_tier-${tier}`,
                description: `Définir en Tier ${tier}`,
                default: grade.tier === String(tier),
              })),
            ],
          },
        ],
      },
      {
        type: 10,
        content: `**Rôle(s) attribué(s) lors d'un rank :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 6,
            custom_id: `edit_grade_role-${panelId}-${gradeId}`,
            placeholder: "Sélectionne un rôle...",
            max_values: 25,
            default_values:
              grade.role?.map((r) => ({
                id: r,
                type: "role",
              })) || [],
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
            custom_id: `return-${panelId}-grade`,
            label: "🚪 Retour",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: "aide-grade",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `grade_delete-${panelId}-${gradeId}`,
            label: "🗑️ Supprimer le Grade",
            style: ButtonStyle.Danger,
          },
        ],
      },
    ],
  };
}

async function getGradeContainer(client, panelId, guildColor, panelDatas) {
  const gradesContent = await Promise.all(
    panelDatas.grade.map(async (grade) => ({
      type: 10,
      content: `- ${
        grade.couleur ? `${await getHexEmoji(client, grade.couleur)}` : ""
      } **${grade.nom}**`,
    })),
  );

  const gradeOptions = await Promise.all(
    panelDatas.grade.map(async (grade) => {
      const e = grade.couleur
        ? await getHexEmoji(client, grade.couleur)
        : undefined;

      let emoji;
      if (e) {
        if (e.id && /^\d+$/.test(e.id)) {
          emoji = { id: e.id, name: e.name, animated: e.animated || false };
        } else {
          emoji = { name: e.name || e };
        }
      }

      return {
        label: grade.nom,
        value: `grade_edit-${panelId}-${grade.gradeId}`,
        description: `Configure ${grade.nom}`,
        emoji,
      };
    }),
  );

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      ...gradesContent,
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `grade_edit-${panelId}`,
            placeholder: "Choisis un grade...",
            disabled: !panelDatas.enable,
            options: [
              ...gradeOptions,
              {
                label: "Créer un grade",
                value: `create_grade-${panelId}`,
                description: "Ajoute un nouveau grade au panel",
                emoji: { id: "1418880845808402492" },
              },
            ],
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
          {
            type: 2,
            custom_id: "aide-grade",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
        ],
      },
    ],
  };
}

async function getEffectifContainer(panelId, guildColor, panelDatas) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 10,
        content: `**Salon où sera envoyé l'effectif :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-effectif-effectif`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Il te faut d'abord activer un rôle-play",
            max_values: 1,
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ],
            default_values: [
              panelDatas.enable && panelDatas.channels.effectif
                ? {
                    type: "channel",
                    id: panelDatas.channels.effectif,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      ...(panelDatas.effectif?.button?.length > 0
        ? panelDatas.effectif.button.map((btn, index) => ({
            type: 1,
            components: [
              {
                type: 2,
                label: btn.label,
                style: ButtonStyle.Link,
                url: btn.lien,
              },
              {
                type: 2,
                custom_id: `effectif_editbutton-${panelId}-${btn.label}`,
                label: "Modifier le Bouton",
                style: ButtonStyle.Primary,
              },
              {
                type: 2,
                custom_id: `effectif_deletebutton-${panelId}-${btn.label}`,
                label: "Supprimer le Bouton",
                style: ButtonStyle.Danger,
              },
            ],
          }))
        : [
            {
              type: 10,
              content: "Aucun bouton n'a été configuré",
            },
          ]),
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
            custom_id: `send_effectif-${panelId}`,
            label: "👥 Envoyer l'effectif",
            style: ButtonStyle.Primary,
            disabled:
              panelDatas.channels.effectif && panelDatas.enable ? false : true,
          },
          {
            type: 2,
            custom_id: `effectif_addbutton-${panelId}`,
            label: "➕ Ajouter un Bouton",
            style: ButtonStyle.Primary,
            disabled: panelDatas.effectif?.button?.length >= 3,
          },
        ],
      },
    ],
  };
}

async function getEditPanelContainer(panelId, guildColor, panelDatas) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
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
            label: "Renommer le Rôle-Play",
            style: ButtonStyle.Primary,
          },
          {
            type: 2,
            custom_id: `config_panel_emoji-${panelId}`,
            label: "Modifier l'Emoji",
            style: ButtonStyle.Primary,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config_panel_description-${panelId}`,
            label: "Modifier la Description",
            style: ButtonStyle.Primary,
          },
          {
            type: 2,
            custom_id: `config_panel_delete-${panelId}`,
            label: "Supprimer le Rôle-Play",
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
  };
}

async function getDepotDePlainteContainer(panelId, guildColor, panelDatas) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
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
            content: `**Lien Forum :** ${
              panelDatas.depotdeplainte.lien || "Aucun lien configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `config_depotdeplainte_lien-${panelId}`,
          label: "💬 Modifier le lien Forum",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 10,
        content: `**Salon où sera envoyé les dépôts de plainte :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-depotdeplainte-depotdeplainte`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Il te faut d'abord activer un rôle-play",
            max_values: 1,
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
            ],
            default_values: [
              panelDatas.enable && panelDatas.channels.depotdeplainte
                ? {
                    type: "channel",
                    id: panelDatas.channels.depotdeplainte,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      {
        type: 10,
        content: `**Rôle mentionné lors des dépôts de plainte :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 6,
            custom_id: `config-${panelId}-role-depotdeplainte`,
            placeholder: "Sélectionne un rôle...",
            min_values: 0,
            max_values: 25,
            default_values:
              panelDatas.roles.candidature?.map((r) => ({
                id: r,
                type: "role",
              })) || [],
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
          {
            type: 2,
            custom_id: "aide-depotdeplainte",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
        ],
      },
    ],
  };
}

async function getCandidatureContainer(panelId, guildColor, panelDatas) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
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
            content: `**Lien Forum :** ${
              panelDatas.candidature.lien || "Aucun lien configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `config_candidature_lien-${panelId}`,
          label: "💬 Modifier le lien Forum",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 10,
        content: `**Salon où sera envoyé les candidatures :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 8,
            custom_id: `config-${panelId}-channel-candidature-candidature`,
            placeholder: panelDatas.enable
              ? "Définis un salon"
              : "Il te faut d'abord activer un rôle-play",
            max_values: 1,
            min_values: 0,
            disabled: panelDatas.enable ? false : true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
            ],
            default_values: [
              panelDatas.enable && panelDatas.channels.candidature
                ? {
                    type: "channel",
                    id: panelDatas.channels.candidature,
                  }
                : undefined,
            ].filter(Boolean),
          },
        ],
      },
      {
        type: 10,
        content: `**Rôle mentionné lors des candidatures :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 6,
            custom_id: `config-${panelId}-role-candidature`,
            placeholder: "Sélectionne un rôle...",
            min_values: 0,
            max_values: 25,
            default_values:
              panelDatas.roles.candidature?.map((r) => ({
                id: r,
                type: "role",
              })) || [],
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
          {
            type: 2,
            custom_id: "aide-candidature",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
        ],
      },
    ],
  };
}

async function getTacheContainer(client, panelId, guildColor, panelDatas) {
  const tasksContent = await Promise.all(
    panelDatas.tasks.map(async (task) => ({
      type: 10,
      content: `- ${task.emoji ? `${task.emoji} ` : ""}**${task.name.slice(0, 100)}**`,
    })),
  );

  const taskOptions = await Promise.all(
    panelDatas.tasks.map(async (task) => {
      let emoji = undefined;

      if (task.emoji && task.emoji !== false) {
        const customEmojiMatch = task.emoji.match(
          /^<a?:([a-zA-Z0-9_]+):(\d+)>$/,
        );
        if (customEmojiMatch) {
          emoji = {
            id: customEmojiMatch[2],
            name: customEmojiMatch[1],
            animated: task.emoji.startsWith("<a:"),
          };
        } else if (
          /^\p{Extended_Pictographic}$/u.test(task.emoji) ||
          task.emoji.length <= 3
        ) {
          emoji = { name: task.emoji };
        }
      }

      return {
        label: task.name,
        value: `tache_edit-${panelId}-${task.taskId}`,
        description: `Configure ${task.name}`,
        ...(emoji ? { emoji } : {}),
      };
    }),
  );

  const canCreateTask = taskOptions.length < 25;

  if (canCreateTask) {
    taskOptions.push({
      label: "Créer une tâche",
      value: `create_tache-${panelId}`,
      description: "Ajoute une nouvelle tâche au panel",
      emoji: { id: "1418880845808402492" },
    });
  }

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
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
            content: `**Texte Affiché :** ${
              panelDatas.texte_tache || "Aucun texte affiché n'est configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_tache_texte-${panelId}`,
          label: "🔠 Modifier le Texte Affiché",
          style: ButtonStyle.Primary,
        },
      },
      ...tasksContent,
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `tache_edit-${panelId}`,
            placeholder: "Choisis une tâche...",
            disabled: !panelDatas.enable,
            options: taskOptions,
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
          {
            type: 2,
            custom_id: "aide-tâche",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `send_panel-${panelId}`,
            label: "💲 Envoyer le panel de tâche",
            style: ButtonStyle.Primary,
            disabled:
              panelDatas.channels.tasks && panelDatas.enable ? false : true,
          },
        ],
      },
    ],
  };
}

async function getEditTacheContainer(
  client,
  panelId,
  guildColor,
  panelDatas,
  tacheId,
) {
  const task = panelDatas.tasks.find((g) => g.taskId === tacheId);

  const grades = panelDatas.grade || [];

  const gradeOptions =
    grades.length > 0
      ? await Promise.all(
          grades.map(async (grade) => {
            const e = grade.couleur
              ? await getHexEmoji(client, grade.couleur)
              : undefined;

            let emoji;
            if (e) {
              if (e.id && /^\d+$/.test(e.id)) {
                emoji = {
                  id: e.id,
                  name: e.name,
                  animated: e.animated || false,
                };
              } else {
                emoji = { name: e.name || e };
              }
            }

            return {
              label: grade.nom,
              value: `edit_tache_grade-${grade.gradeId}`,
              description: grade.couleur
                ? `Couleur : ${grade.couleur || "Aucune"} | Tier : ${
                    grade.tier || "Aucun"
                  }`
                : "Aucune couleur définie",
              emoji,
              default: task.grade?.includes(String(grade.gradeId)) || false,
            };
          }),
        )
      : [
          {
            label: "Aucun grade configuré",
            value: "aucun_grade_configure",
            description: "Veuillez créer au moins un grade avant de continuer",
            default: false,
          },
        ];

  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          panelDatas.emoji ? `${panelDatas.emoji} ` : ""
        } Configuration du Panel ${panelDatas.name}`,
      },
      {
        type: 9,
        components: [{ type: 10, content: `**Nom :** ${task.name}` }],
        accessory: {
          type: 2,
          custom_id: `edit_tache_nom-${panelId}-${task.taskId}`,
          label: "⚙️ Modifier le Nom",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Description :** ${
              task.description || "Aucune description définie"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_tache_description-${panelId}-${task.taskId}`,
          label: "📜 Modifier la Description",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Emoji :** ${task.emoji || "Aucun émoji défini"}`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_tache_emoji-${panelId}-${task.taskId}`,
          label: "🎨 Modifier l'Emoji",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Lien Forum :** ${
              task.url || "Aucune catégorie forum définie"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_tache_lien-${panelId}-${task.taskId}`,
          label: "🔗 Modifier le Lien Forum",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Salaire :** ${
              task.salaire
                ? Object.entries(task.salaire)
                    .map(
                      ([jour, montant]) =>
                        `\`${jour}\`: ${Number(montant).toLocaleString(
                          "de-DE",
                        )}$`,
                    )
                    .join(" | ")
                : "Aucun salaire configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `edit_tache_salaire-${panelId}-${task.taskId}`,
          label: "💲 Modifier le Salaire",
          style: ButtonStyle.Primary,
        },
      },
      {
        type: 10,
        content: `**Niveau de vérification :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `edit_tache_verification-${panelId}-${task.taskId}`,
            placeholder: "Choisis un Niveau de Vérification...",
            options: [
              {
                label: "100% Manuel",
                value: "edit_tache_verification-1",
                description: "Tout est entièrement manuel",
                default: task.type === "1",
              },
              {
                label: "Vérification",
                value: "edit_tache_verification-2",
                description: "La tâche est vérifiée avant d'être envoyée",
                default: task.type === "2",
              },
              {
                label: "Acceptation Automatique",
                value: "edit_tache_verification-3",
                description:
                  "La tâche est automatiquement acceptée si elle est vérifiée",
                default: task.type === "3",
              },
              {
                label: "Totalement Automatique",
                value: "edit_tache_verification-4",
                description:
                  "Le robot vérifie de lui même les tâches effectuées",
                default: task.type === "4",
              },
            ],
          },
        ],
      },
      {
        type: 10,
        content: `**Grade autorisé :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `edit_tache_grade-${panelId}-${task.taskId}`,
            placeholder:
              grades.length === 0
                ? "Veuillez créer au moins un grade"
                : "Choisis un ou plusieurs Grades autorisés...",
            min_values: 0,
            max_values: grades.length > 0 ? grades.length : 1,
            options: gradeOptions,
            disabled: grades.length === 0,
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
            custom_id: `return-${panelId}-tache`,
            label: "🚪 Retour",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: "aide-tâche",
            label: "❓ Aide",
            style: ButtonStyle.Secondary,
          },
          {
            type: 2,
            custom_id: `tache_delete-${panelId}-${task.taskId}`,
            label: "🗑️ Supprimer la Tâche",
            style: ButtonStyle.Danger,
          },
        ],
      },
    ],
  };
}

module.exports = {
  getConfigContainer,
  getPanelContainer,
  getChannelContainer,
  getSalaireContainer,
  getEditPanelContainer,
  getGradeContainer,
  getEditGradeContainer,
  getEffectifContainer,
  getCandidatureContainer,
  getDepotDePlainteContainer,
  getTacheContainer,
  getEditTacheContainer,
};
