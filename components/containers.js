const config = require("../config");
const {
  getPanelsSelecString,
  getBoutiquesSelecString,
} = require("./selectsString");
const { getHexEmoji } = require("../utils/functions/emojis");
const fs = require("node:fs/promises");
const path = require("node:path");

async function getConfigContainer(serverDatas, serv) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);

  let panelsComponents = [];
  if (!serverDatas.panels || serverDatas.panels.length === 0) {
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
            custom_id: `restaurer-panel-${panel.id}`,
            label: "Restaurer",
            emoji: { name: "♻️" },
            style: 1,
          }
        : {
            type: 2,
            custom_id: `toggle-panel-${panel.id}-acceuil`,
            label: panel.enable ? "Activé" : "Désactivé",
            emoji: { name: panel.enable ? "✅" : "❌" },
            style: panel.enable ? 3 : 4,
          },
    }));
  }

  let boutiquesComponents = [];
  if (!serverDatas.boutiques || serverDatas.boutiques.length === 0) {
    boutiquesComponents.push({
      type: 10,
      content: "Aucune boutique configurée pour le moment.",
    });
  } else {
    boutiquesComponents = serverDatas.boutiques.map((shop) => ({
      type: 9,
      components: [
        {
          type: 10,
          content: `${shop.emoji ? `${shop.emoji} ` : ""}Boutique ${
            shop.name
          } ${
            shop.delete
              ? `\n*Suppression définitive dans <t:${shop.delete}:R> !*`
              : ""
          }`,
        },
      ],
      accessory: shop.delete
        ? {
            type: 2,
            custom_id: `restaurer-boutique-${shop.id}`,
            label: "Restaurer",
            emoji: { name: "♻️" },
            style: 1,
          }
        : {
            type: 2,
            custom_id: `toggle-boutique-${shop.id}-acceuil`,
            label: shop.enable ? "Activée" : "Désactivée",
            emoji: { name: shop.enable ? "✅" : "❌" },
            style: shop.enable ? 3 : 4,
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
      { type: 14, spacing: 2 },
      { type: 10, content: "### 🧩 Panels configurés :" },
      ...panelsComponents,
      {
        type: 1,
        components: [getPanelsSelecString(serverDatas)],
      },
      { type: 14, spacing: 2 },
      { type: 10, content: "### 🛒 Boutiques configurées :" },
      ...boutiquesComponents,
      {
        type: 1,
        components: [getBoutiquesSelecString(serverDatas)],
      },
      { type: 14, spacing: 2 },
    ],
  };

  if (serverDatas.lastUser && serverDatas.timestamp) {
    returnComponent.components.push({
      type: 10,
      content: `-# Dernières modifications par <@${serverDatas.lastUser}> <t:${serverDatas.timestamp}:R>`,
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
        spacing: 1,
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
          style: panelDatas.enable ? 3 : 4,
        },
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config-channel-${panelId}-panel`,
            label: "Configurer les Salons",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-grade-${panelId}-panel`,
            label: "Configurer les Grades",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-tache-${panelId}-panel`,
            label: "Configurer les Tâches",
            style: 1,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config-panel-${panelId}-panel`,
            label: "Configurer le Panel",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-salaire-${panelId}-panel`,
            label: "Configurer les Salaires",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-resumeonu-${panelId}-panel`,
            label: "Configurer le Résumé ONU",
            style: 2,
            disabled: true,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config-depotdeplainte-${panelId}-panel`,
            label: "Configurer le Dépot de Plainte",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-candidature-${panelId}-panel`,
            label: "Configurer les Candidature",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-effectif-${panelId}-panel`,
            label: "Configurer l'Effectif",
            style: 1,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: "return",
            label: "🚪 Retour à l'Acceuil",
            style: 2,
          },
          {
            type: 2,
            custom_id: `logs-first-${panelId}-${guildColor}-1-panel`,
            label: "📜 Afficher les Logs",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueContainer(guildColor, boutiqueDatas, boutiqueId) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          boutiqueDatas.emoji ? `${boutiqueDatas.emoji} ` : ""
        }Configuration de la Boutique ${boutiqueDatas.name}`,
      },
      {
        type: 14,
        spacing: 1,
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
          custom_id: `toggle-boutique-${boutiqueId}-boutique`,
          label: boutiqueDatas.enable ? "Activée" : "Désactivée",
          emoji: { name: boutiqueDatas.enable ? "✅" : "❌" },
          style: boutiqueDatas.enable ? 3 : 4,
        },
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config-categorie-${boutiqueId}-boutique`,
            label: "Configurer les Catégories",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-article-${boutiqueId}-boutique`,
            label: "Configurer les Articles",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-reduction-${boutiqueId}-boutique`,
            label: "Configurer les Réductions",
            style: 1,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `config-boutique-${boutiqueId}-boutique`,
            label: "Configurer la Boutique",
            style: 1,
          },
          {
            type: 2,
            custom_id: `config-payement-${boutiqueId}-boutique`,
            label: "Configurer le Payement",
            style: 1,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: "return",
            label: "🚪 Retour à l'Acceuil",
            style: 2,
          },
          {
            type: 2,
            custom_id: `logs-first-${boutiqueId}-${guildColor}-1-boutique`,
            label: "📜 Afficher les Logs",
            style: 2,
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
            channel_types: [0, 5],
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
        spacing: 1,
      },
      ...channelsOptions,
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: `send_panel-${panelId}`,
            label: "💲 Envoyer le panel de tâche",
            style: 1,
            disabled:
              panelDatas.channels.tasks &&
              panelDatas.enable &&
              panelDatas.panel_tache.description
                ? false
                : true,
          },
          {
            type: 2,
            custom_id: `send_effectif-${panelId}`,
            label: "👥 Envoyer l'effectif",
            style: 1,
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
        spacing: 1,
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
            channel_types: [0, 5],
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
            channel_types: [0, 5],
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
          style: 1,
          disabled: panelDatas.enable ? false : true,
        },
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-salaire",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `salairePost-${panelId}`,
            label: "💰 Envoyer les Salaires",
            style: 1,
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
          custom_id: `grade_edit-${panelId}-${gradeId}-nom`,
          label: "⚙️ Modifier le Nom",
          style: 1,
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
          custom_id: `grade_edit-${panelId}-${gradeId}-couleur`,
          label: "🎨 Modifier la Couleur",
          style: 1,
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
            custom_id: `grade_edit_tier-${panelId}-${gradeId}`,
            placeholder: "Choisis un Tier...",
            options: [
              ...[5, 4, 3, 2, 1].map((tier) => ({
                label: `Tier ${tier}`,
                value: `grade_edit_tier-${tier}`,
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
            custom_id: `grade_edit_role-${panelId}-${gradeId}`,
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
        spacing: 1,
      },

      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel-grade`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-grade",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `grade_delete-${panelId}-${gradeId}`,
            label: "🗑️ Supprimer le Grade",
            style: 4,
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
        spacing: 1,
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-grade",
            label: "❓ Aide",
            style: 2,
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
        spacing: 1,
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
            channel_types: [0, 5],
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
        spacing: 1,
      },
      ...(panelDatas.effectif?.button?.length > 0
        ? panelDatas.effectif.button.map((btn, index) => ({
            type: 1,
            components: [
              {
                type: 2,
                label: btn.label,
                style: 5,
                url: btn.lien,
              },
              {
                type: 2,
                custom_id: `effectif_editbutton-${panelId}-${btn.label}`,
                label: "Modifier le Bouton",
                style: 1,
              },
              {
                type: 2,
                custom_id: `effectif_deletebutton-${panelId}-${btn.label}`,
                label: "Supprimer le Bouton",
                style: 4,
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: `send_effectif-${panelId}`,
            label: "👥 Envoyer l'effectif",
            style: 1,
            disabled:
              panelDatas.channels.effectif && panelDatas.enable ? false : true,
          },
          {
            type: 2,
            custom_id: `effectif_addbutton-${panelId}`,
            label: "➕ Ajouter un Bouton",
            style: 1,
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `panel_edit-name-${panelId}`,
            label: "Renommer le Rôle-Play",
            style: 1,
          },
          {
            type: 2,
            custom_id: `panel_edit-emoji-${panelId}`,
            label: "Modifier l'Emoji",
            style: 1,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `panel_edit-description-${panelId}`,
            label: "Modifier la Description",
            style: 1,
          },
          {
            type: 2,
            custom_id: `panel_delete-${panelId}`,
            label: "Supprimer le Rôle-Play",
            style: 4,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
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
        spacing: 1,
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
          style: 1,
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
            channel_types: [0, 5, 15],
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-depotdeplainte",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getResumeONUContainer(panelId, guildColor, panelDatas) {
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
        spacing: 1,
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Lien Forum :** ${
              panelDatas.resumeonu.lien || "Aucun lien configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `config_resumeonu_lien-${panelId}`,
          label: "💬 Modifier le lien Forum",
          style: 1,
        },
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            url: `https://static.nationsglory.fr/resume-onu/${guildColor}.png`,
            label: "Voir le Résumé ONU",
            style: 5,
            disabled: !panelDatas.resumeonu.found,
          },
          {
            type: 2,
            custom_id: "aide-resumeonu",
            label: "❓ Aide",
            style: 2,
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
        spacing: 1,
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
          style: 1,
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
            channel_types: [0, 5, 15],
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-candidature",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getTacheContainer(panelId, guildColor, panelDatas) {
  const tasksContent = await Promise.all(
    panelDatas.tasks.map(async (task) => ({
      type: 10,
      content: `- ${task.emoji ? `${task.emoji} ` : ""}**${task.name.slice(
        0,
        100,
      )}**`,
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
        spacing: 1,
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Texte Affiché :** ${
              panelDatas.panel_tache.description ||
              "Aucun texte affiché n'est configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `tache_edit_texte-${panelId}`,
          label: "🔠 Modifier le Texte Affiché",
          style: 1,
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
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-tâche",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `send_panel-${panelId}`,
            label: "💲 Envoyer le panel de tâche",
            style: 1,
            disabled:
              panelDatas.channels.tasks &&
              panelDatas.enable &&
              panelDatas.panel_tache.description
                ? false
                : true,
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

  const gradeOptions_valider =
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
              default:
                task.grade_valider?.includes(String(grade.gradeId)) || false,
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
          custom_id: `tache_edit-${panelId}-${task.taskId}-name`,
          label: "⚙️ Modifier le Nom",
          style: 1,
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
          custom_id: `tache_edit-${panelId}-${task.taskId}-description`,
          label: "📜 Modifier la Description",
          style: 1,
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
          custom_id: `tache_edit-${panelId}-${task.taskId}-emoji`,
          label: "🎨 Modifier l'Emoji",
          style: 1,
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
          custom_id: `tache_edit-${panelId}-${task.taskId}-url`,
          label: "🔗 Modifier le Lien Forum",
          style: 1,
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
          custom_id: `tache_edit_salaire-${panelId}-${task.taskId}`,
          label: "💲 Modifier le Salaire",
          style: 1,
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
        content: `**Grade autorisé à effectuer la tâche :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `edit_tache_grade-${panelId}-${task.taskId}-effectuer`,
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
        type: 10,
        content: `**Grade autorisé à accepter ou refuser la tâche :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `edit_tache_grade-${panelId}-${task.taskId}-valider`,
            placeholder:
              grades.length === 0
                ? "Veuillez créer au moins un grade"
                : "Choisis un ou plusieurs Grades autorisés...",
            min_values: 0,
            max_values: grades.length > 0 ? grades.length : 1,
            options: gradeOptions_valider,
            disabled: grades.length === 0,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${panelId}-panel-tache`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-tâche",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `tache_delete-${panelId}-${task.taskId}`,
            label: "🗑️ Supprimer la Tâche",
            style: 4,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueCategorieContainer(
  client,
  boutiqueId,
  guildColor,
  boutiqueDatas,
) {
  let categoriesContent = await Promise.all(
    boutiqueDatas.categorie.map(async (categorie) => ({
      type: 9,
      components: [
        {
          type: 10,
          content: `- ${
            categorie.couleur
              ? `${await getHexEmoji(client, categorie.couleur)}`
              : ""
          } **${categorie.nom}**`,
        },
      ],
      accessory: {
        type: 2,
        custom_id: `categorie_delete-${boutiqueId}-${categorie.id}`,
        label: "Supprimer la Catégorie",
        style: 4,
      },
    })),
  );

  if (boutiqueDatas.categorie.length === 0) {
    categoriesContent = [
      {
        type: 10,
        content: `Aucune catégorie configurée pour le moment.`,
      },
    ];
  }

  const categorieOptions = await Promise.all(
    boutiqueDatas.categorie.map(async (categorie) => {
      const e = categorie.couleur
        ? await getHexEmoji(client, categorie.couleur)
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
        label: categorie.nom,
        value: `categorie_edit-${boutiqueId}-${categorie.id}`,
        description: `Modifier la catégorie "${categorie.nom}"`,
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
          boutiqueDatas.emoji ? `${boutiqueDatas.emoji} ` : ""
        } Configuration de la Boutique ${boutiqueDatas.name}`,
      },
      {
        type: 14,
        spacing: 1,
      },
      ...categoriesContent,
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `categorie_edit-${boutiqueId}`,
            placeholder: "Choisis une catégorie...",
            disabled: !boutiqueDatas.enable,
            options: [
              ...categorieOptions,
              {
                label: "Créer une catégorie",
                value: `create_categorie-${boutiqueId}`,
                description: "Ajoute une nouvelle catégorie à la boutique",
                emoji: { id: "1418880845808402492" },
              },
            ],
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutiqueId}-boutique`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-categorie",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueArticleContainer(
  boutiqueId,
  guildColor,
  boutiqueDatas,
  page,
) {
  const ARTICLES_PER_PAGE = 8;
  const totalPages = Math.ceil(
    boutiqueDatas.article.length / ARTICLES_PER_PAGE,
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (page - 1) * ARTICLES_PER_PAGE;
  const end = start + ARTICLES_PER_PAGE;
  const articlesPage = boutiqueDatas.article.slice(start, end);

  let articleContent = await Promise.all(
    articlesPage.map(async (article) => ({
      type: 9,
      components: [
        {
          type: 10,
          content: `- ${article.emoji ? `${article.emoji} ` : ""}**${
            article.nom
          }**`,
        },
      ],
      accessory: {
        type: 2,
        custom_id: `article_delete-${boutiqueId}-${article.id}`,
        label: "Supprimer l'Article",
        style: 4,
      },
    })),
  );

  if (boutiqueDatas.article.length === 0) {
    articleContent = [
      {
        type: 10,
        content: `Aucun article configuré pour le moment.`,
      },
    ];
  }

  if (boutiqueDatas.categorie.length === 0) {
    articleContent = [
      {
        type: 10,
        content: "Veuillez tout d'abord créer une catégorie.",
      },
    ];
  }

  const articleOptions = await Promise.all(
    articlesPage.map(async (article) => {
      let emoji;
      if (article.emoji && article.emoji !== false) {
        const customEmojiMatch = article.emoji.match(
          /^<a?:([a-zA-Z0-9_]+):(\d+)>$/,
        );
        if (customEmojiMatch) {
          emoji = {
            id: customEmojiMatch[2],
            name: customEmojiMatch[1],
            animated: article.emoji.startsWith("<a:"),
          };
        } else if (
          /^\p{Extended_Pictographic}$/u.test(article.emoji) ||
          article.emoji.length <= 3
        ) {
          emoji = { name: article.emoji };
        }
      }

      return {
        label: article.nom,
        value: `article_edit-${boutiqueId}-${article.id}`,
        description: `Modifier l'article "${article.nom}"`,
        ...(emoji ? { emoji } : {}),
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
          boutiqueDatas.emoji ? `${boutiqueDatas.emoji} ` : ""
        } Configuration de la Boutique ${boutiqueDatas.name}`,
      },
      {
        type: 14,
        spacing: 1,
      },
      ...articleContent,
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `page-article-${currentPage - 1}-${boutiqueId}`,
            label: "◀️",
            style: 1,
            disabled: currentPage <= 1,
          },
          {
            type: 2,
            custom_id: "page_status",
            label: `Page ${currentPage}/${totalPages}`,
            style: 1,
            disabled: true,
          },
          {
            type: 2,
            custom_id: `page-article-${currentPage + 1}-${boutiqueId}`,
            label: "▶️",
            style: 1,
            disabled: currentPage === totalPages,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `article_edit-${boutiqueId}`,
            placeholder: "Choisis un article...",
            disabled:
              !boutiqueDatas.enable || boutiqueDatas.categorie.length === 0,
            options: [
              ...articleOptions,
              {
                label: "Créer un article",
                value: `article_create-${boutiqueId}`,
                description: "Ajoute un nouvel article à la boutique",
                emoji: { id: "1418880845808402492" },
              },
            ],
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutiqueId}-boutique`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-article",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueEditArticleContainer(
  client,
  guildColor,
  articleData,
  serverDatas,
  boutique,
) {
  const categorieOptions = await Promise.all(
    boutique.categorie.map(async (categorie) => {
      const e = categorie.couleur
        ? await getHexEmoji(client, categorie.couleur)
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
        label: categorie.nom,
        value: `article_edit-${String(categorie.id)}`,
        description: `Categorie : ${categorie.nom} | Couleur : ${categorie.couleur}`,
        emoji,
        default: categorie.id === articleData.categorie,
      };
    }),
  );

  const gradesMap = new Map();

  for (const panel of serverDatas.panels || []) {
    for (const grade of panel.grade || []) {
      if (!gradesMap.has(grade.gradeId)) {
        gradesMap.set(grade.gradeId, { ...grade, panelId: panel.id });
      }
    }
  }

  const grades = [...gradesMap.values()];

  const gradeOptions = await Promise.all(
    grades.map(async (grade) => {
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
        value: `article_edit-${String(grade.panelId)}_${String(grade.gradeId)}`,
        description: `Grade ${grade.nom} | Couleur : ${grade.couleur}`,
        ...(emoji ? { emoji } : {}),
        default: articleData.grade.includes(
          `${String(grade.panelId)}_${String(grade.gradeId)}`,
        ),
      };
    }),
  );

  let media = [];
  const files = [];
  if (articleData.image && typeof articleData.image === "string") {
    const buffer = await fs.readFile(articleData.image);
    const fileName = path.basename(articleData.image);

    files.push({
      attachment: buffer,
      name: fileName,
    });

    media = [
      {
        type: 12,
        items: [
          {
            type: 13,
            media: {
              url: `attachment://${fileName}`,
            },
          },
        ],
      },
    ];
  }

  return {
    files,
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          articleData.emoji ? `${articleData.emoji} ` : ""
        } Configuration de l'Article ${articleData.nom}`,
      },
      {
        type: 9,
        components: [{ type: 10, content: `**Nom :** ${articleData.nom}` }],
        accessory: {
          type: 2,
          custom_id: `article_edit-${boutique.id}-${articleData.id}-nom`,
          label: "⚙️ Modifier le Nom",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Emoji :** ${
              articleData.emoji
                ? `${articleData.emoji} `
                : "Aucun émoji configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `article_edit-${boutique.id}-${articleData.id}-emoji`,
          label: "🎨 Modifier l'Emoji",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Prix Unitaire :** ${
              articleData.prix
                ? `${articleData.prix.toLocaleString()}$`
                : "Aucun prix configuré"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `article_edit-${boutique.id}-${articleData.id}-prix`,
          label: "💲 Modifier le Prix Unitaire",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Quantité Disponible :** ${
              articleData.quantite !== -1 ? `${articleData.quantite}` : "Infini"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `article_edit-${boutique.id}-${articleData.id}-quantite`,
          label: "🔢 Modifier la Quantité Disponible",
          style: 1,
        },
      },
      {
        type: 10,
        content: `**Grade(s) Vendeur(s) :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `article_edit-${boutique.id}-${articleData.id}-grade`,
            placeholder: "Choisis un ou plusieurs grades...",
            max_values: gradeOptions.length,
            options: gradeOptions,
          },
        ],
      },
      {
        type: 10,
        content: `**Catégorie Associée :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `article_edit-${boutique.id}-${articleData.id}-categorie`,
            placeholder: "Choisis une catégorie...",
            options: categorieOptions,
          },
        ],
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Image :** ${
              articleData.image ? "" : "Aucune image configurée"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `article_edit-${boutique.id}-${articleData.id}-image`,
          label: "🖼️ Modifier l'Image",
          style: 1,
        },
      },
      ...media,
      {
        type: 14,
        spacing: 1,
      },

      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutique.id}-boutique-article`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-article",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `article_delete-${boutique.id}-${articleData.id}`,
            label: "🗑️ Supprimer l'Article",
            style: 4,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueReductionContainer(
  boutiqueId,
  guildColor,
  boutiqueDatas,
  page,
) {
  const REDUCTION_PER_PAGE = 8;
  const totalPages = Math.ceil(
    boutiqueDatas.reduction.length / REDUCTION_PER_PAGE,
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (page - 1) * REDUCTION_PER_PAGE;
  const end = start + REDUCTION_PER_PAGE;
  const reductionsPage = boutiqueDatas.reduction.slice(start, end);

  let reductionContent = await Promise.all(
    reductionsPage.map(async (reduction) => ({
      type: 9,
      components: [
        {
          type: 10,
          content: `- ${reduction.debut ? `<t:${reduction.debut}:f> ` : ""}${
            reduction.fin ? `➜ <t:${reduction.fin}:f> ` : ""
          }**${reduction.code}**`,
        },
      ],
      accessory: {
        type: 2,
        custom_id: `reduction_delete-${boutiqueId}-${reduction.id}`,
        label: "Supprimer la Réduction",
        style: 4,
      },
    })),
  );

  if (boutiqueDatas.reduction.length === 0) {
    reductionContent = [
      {
        type: 10,
        content: `Aucune réduction configurée pour le moment.`,
      },
    ];
  }

  if (
    boutiqueDatas.categorie.length === 0 ||
    boutiqueDatas.article.length === 0
  ) {
    reductionContent = [
      {
        type: 10,
        content:
          "Veuillez tout d'abord créer une catégorie ainsi qu'un article.",
      },
    ];
  }

  const reductionOptions = await Promise.all(
    reductionsPage.map(async (reduction) => {
      return {
        label: reduction.code,
        value: `reduction_edit-${boutiqueId}-${reduction.id}`,
        description: `Modifier la réduction "${reduction.code}"`,
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
          boutiqueDatas.emoji ? `${boutiqueDatas.emoji} ` : ""
        } Configuration de la Boutique ${boutiqueDatas.name}`,
      },
      {
        type: 14,
        spacing: 1,
      },
      ...reductionContent,
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `page-reduction-${currentPage - 1}-${boutiqueId}`,
            label: "◀️",
            style: 1,
            disabled: currentPage <= 1,
          },
          {
            type: 2,
            custom_id: "page_status",
            label: `Page ${currentPage}/${totalPages}`,
            style: 1,
            disabled: true,
          },
          {
            type: 2,
            custom_id: `page-reduction-${currentPage + 1}-${boutiqueId}`,
            label: "▶️",
            style: 1,
            disabled: currentPage === totalPages,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `reduction_edit-${boutiqueId}`,
            placeholder: "Choisis une réduction...",
            disabled:
              !boutiqueDatas.enable || boutiqueDatas.categorie.length === 0,
            options: [
              ...reductionOptions,
              {
                label: "Créer une réduction",
                value: `reduction_create-${boutiqueId}`,
                description: "Ajoute une nouvelle réduction à la boutique",
                emoji: { id: "1418880845808402492" },
              },
            ],
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutiqueId}-boutique`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-reduction",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ],
  };
}

async function getBoutiqueEditReductionContainer(
  client,
  guildColor,
  reductionData,
  boutique,
) {
  const categorieOptions = await Promise.all(
    boutique.categorie.map(async (categorie) => {
      const e = categorie.couleur
        ? await getHexEmoji(client, categorie.couleur)
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
        label: categorie.nom,
        value: `reduction_edit-${categorie.id}`,
        description: `Couleur : ${categorie.couleur}`,
        emoji,
        default: reductionData.categorie.includes(categorie.id),
      };
    }),
  );

  const categorieById = new Map(boutique.categorie.map((c) => [c.id, c.nom]));

  const articleOptions = await Promise.all(
    boutique.article
      .filter((a) => reductionData.categorie.includes(a.categorie))
      .map(async (article) => {
        let emoji = null;

        if (article.emoji) {
          const customEmojiMatch = article.emoji.match(
            /^<a?:([a-zA-Z0-9_]+):(\d+)>$/,
          );

          if (customEmojiMatch) {
            emoji = {
              name: customEmojiMatch[1],
              id: customEmojiMatch[2],
              animated: article.emoji.startsWith("<a:"),
            };
          } else {
            emoji = {
              name: article.emoji,
            };
          }
        }

        return {
          label: article.nom,
          value: `reduction_edit-${article.id}`,
          description: `Categorie : ${
            categorieById.get(article.categorie) ?? "Inconnue"
          } | Prix Unitaire : ${article.prix}`,
          ...(emoji && { emoji }),
          default: reductionData.article.includes(article.id),
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
          reductionData.emoji ? `${reductionData.emoji} ` : ""
        } Configuration de la Réduction ${reductionData.code}`,
      },
      {
        type: 9,
        components: [{ type: 10, content: `**Code :** ${reductionData.code}` }],
        accessory: {
          type: 2,
          custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-code`,
          label: "⚙️ Modifier le Code",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Valeur de Réduction :** ${reductionData.valeur}`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-valeur`,
          label: "💵 Modifier la Valeur",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Nombre d'Utilisation Maximum :** ${
              reductionData.usemax !== -1 ? `${reductionData.usemax}` : "Infini"
            }`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-usemax`,
          label: "🧮 Modifier le nombre d'Utilisation Maximum",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `**Date de Début :** <t:${reductionData.debut}:f>`,
          },
        ],
        accessory: {
          type: 2,
          custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-debut`,
          label: "⏲️ Modifier la Date de Début",
          style: 1,
        },
      },
      {
        type: 9,
        components: [
          { type: 10, content: `**Date de Fin :** <t:${reductionData.fin}:f>` },
        ],
        accessory: {
          type: 2,
          custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-fin`,
          label: "⏲️ Modifier la Date de Fin",
          style: 1,
        },
      },
      {
        type: 10,
        content: `**Catégorie Associée :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-categorie`,
            max_values:
              categorieOptions.length === 0 ? 1 : categorieOptions.length,
            placeholder:
              categorieOptions.length === 0
                ? "Veuillez créer une catégorie"
                : "Choisis une ou plusieurs catégories...",
            options:
              categorieOptions.length === 0
                ? [
                    {
                      label: "Veuillez créer une catégorie",
                      value: "Veuillez créer une catégorie",
                      description: "Veuillez créer une catégorie",
                    },
                  ]
                : categorieOptions,
            disabled: categorieOptions.length === 0,
          },
        ],
      },
      {
        type: 10,
        content: `**Article Associée :**`,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `reduction_edit-${boutique.id}-${reductionData.id}-article`,
            max_values: articleOptions.length === 0 ? 1 : articleOptions.length,
            placeholder:
              articleOptions.length === 0
                ? "Veuillez choisir une catégorie possédant des articles"
                : "Choisis un ou plusieurs articles...",
            options:
              articleOptions.length === 0
                ? [
                    {
                      label:
                        "Veuillez choisir une catégorie possédant des articles",
                      value:
                        "Veuillez choisir une catégorie possédant des articles",
                      description:
                        "Veuillez choisir une catégorie possédant des articles",
                    },
                  ]
                : articleOptions,
            disabled: articleOptions.length === 0,
          },
        ],
      },
      {
        type: 14,
        spacing: 1,
      },

      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutique.id}-boutique-reduction`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-reduction",
            label: "❓ Aide",
            style: 2,
          },
          {
            type: 2,
            custom_id: `reduction_delete-${boutique.id}-${reductionData.id}`,
            label: "🗑️ Supprimer la Réduction",
            style: 4,
          },
        ],
      },
    ],
  };
}

async function getBoutiquePayementContainer(
  boutiqueId,
  guildColor,
  boutiqueDatas,
) {
  return {
    type: 17,
    accent_color: config.couleur[guildColor],
    components: [
      {
        type: 10,
        content: `## ${
          boutiqueDatas.emoji ? `${boutiqueDatas.emoji} ` : ""
        } Configuration de la Boutique ${boutiqueDatas.name}`,
      },
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `boutique_payement-${boutiqueId}`,
            placeholder: "Choisit la manière de payer",
            options: [
              {
                label: "Manuelle",
                value: `boutique_payement-${boutiqueId}-manuelle`,
                description: "Les joueurs devront envoyer une capture d'écran",
                emoji: { name: "🤚" },
                default: boutiqueDatas.payement.mode === "manuelle",
              },
              {
                label: "Automatique",
                value: `boutique_payement-${boutiqueId}-automatique`,
                description: "Les joueurs devront faire une commande en jeu",
                emoji: { name: "🤖" },
                default: boutiqueDatas.payement.mode === "automatique",
              },
            ],
          },
        ],
      },
      boutiqueDatas.payement.mode === "automatique"
        ? {
            type: 9,
            components: [
              {
                type: 10,
                content: `**Commande à exécuter pour payer :** \`\`/${boutiqueDatas.payement.commande}\`\``,
              },
            ],
            accessory: {
              type: 2,
              custom_id: `boutique_payement-${boutiqueId}-commande`,
              label: "🤖 Modifier la Commande",
              style: 1,
            },
          }
        : null,
      boutiqueDatas.payement.mode === "automatique"
        ? {
            type: 1,
            components: [
              {
                type: 2,
                custom_id: `boutique_payement-${boutiqueId}-donnee`,
                label: "💰 Modifier l'argent d'un joueur",
                style: 3,
              },
            ],
          }
        : null,
      {
        type: 14,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `return-${boutiqueId}-boutique`,
            label: "🚪 Retour",
            style: 2,
          },
          {
            type: 2,
            custom_id: "aide-payement",
            label: "❓ Aide",
            style: 2,
          },
        ],
      },
    ].filter(Boolean),
  };
}

module.exports = {
  getConfigContainer,
  getPanelContainer,
  getBoutiqueContainer,
  getChannelContainer,
  getSalaireContainer,
  getEditPanelContainer,
  getGradeContainer,
  getEditGradeContainer,
  getEffectifContainer,
  getResumeONUContainer,
  getCandidatureContainer,
  getDepotDePlainteContainer,
  getTacheContainer,
  getEditTacheContainer,
  getBoutiqueCategorieContainer,
  getBoutiqueArticleContainer,
  getBoutiqueEditArticleContainer,
  getBoutiqueReductionContainer,
  getBoutiqueEditReductionContainer,
  getBoutiquePayementContainer,
};
