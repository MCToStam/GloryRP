const { discordStaff } = require("../../utils/functions/linkedUser");
const updateServeurDB = require("../../utils/functions/updateServeurDB");
const config = require("../../config.js");

module.exports = async (client, guild) => {
  try {
    await updateServeurDB(client);

    const auditLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: 28,
    });
    const botAddLog = auditLogs.entries.find(
      (entry) => entry.target.id === client.user.id,
    );
    const inviter = botAddLog?.executor;

    const { pseudonym, servers } = await discordStaff(inviter.id);

    const logChannel = await client.channels
      .fetch(config.log_channels.invitationBot)
      .catch(() => null);

    const sendLog = async (title, content, color = config.colors.success) => {
      if (!logChannel?.isTextBased()) return;
      const container = {
        type: 17,
        accent_color: color,
        components: [
          { type: 10, content: title },
          { type: 14, spacing: 2 },
          { type: 10, content },
        ],
      };
      await logChannel.send({
        components: [container],
        flags: 32768,
      });
    };

    if (!pseudonym) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          { type: 10, content: `## :x: Compte non Lié` },
          { type: 14, spacing: 2 },
          {
            type: 10,
            content:
              "Ton compte Discord doit être lié à ton compte NationsGlory pour effectuer cette action.",
          },
          { type: 14, spacing: 2 },
          {
            type: 1,
            components: [
              {
                type: 2,
                url: "https://glorybot.fr/user/profile",
                label: "🔗 Lier son Compte",
                style: 5,
              },
            ],
          },
        ],
      };

      await guild.leave();
      await inviter.send({
        components: [errorContainer],
        flags: 32768,
        allowedMentions: { parse: [] },
      });

      await sendLog(
        "## :x: Accès Refusé",
        `Tentative d'invitation par <@${inviter.id}> sur le serveur **${
          guild.name
        }**.\n> Membres : ${guild.memberCount}\n> Propriétaire : <@${
          guild.ownerId
        }>\n> Date de création : <t:${Math.floor(
          guild.createdTimestamp / 1000,
        )}:R>`,
        config.colors.error,
      );
      return;
    }

    if (servers.length === 0) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          { type: 10, content: `## :x: Accès Refusé` },
          { type: 14, spacing: 2 },
          {
            type: 10,
            content:
              "GloryRP est un robot uniquement disponible aux différents staffs de NationsGlory, il est donc formellement interdit de l'inviter sur un autre serveur Discord que ceux autorisés.",
          },
          { type: 14, spacing: 2 },
          {
            type: 1,
            components: [
              {
                type: 2,
                url: "https://discord.com/oauth2/authorize?client_id=829422257130176523",
                label: "Inviter GloryBot",
                emoji: "1360717989267378477",
                style: 5,
              },
            ],
          },
        ],
      };

      await guild.leave();
      await inviter.send({
        components: [errorContainer],
        flags: 32768,
        allowedMentions: { parse: [] },
      });

      await sendLog(
        "## :x: Accès Refusé",
        `Tentative d'invitation par <@${inviter.id}> sur le serveur **${
          guild.name
        }**.\n> Membres : ${guild.memberCount}\n> Propriétaire : <@${
          guild.ownerId
        }>\n> Date de création : <t:${Math.floor(
          guild.createdTimestamp / 1000,
        )}:R>`,
        config.colors.error,
      );
      return;
    }

    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        { type: 10, content: `## 🎉 Merci d'avoir invité GloryRP` },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content:
            "Nous vous remercions pour l'interet que vous portez à l'égard de notre travail. Afin d'utiliser au mieux ce robot, il n'est constitué d'uniquement 5 commandes :\n- ``/config`` : Permet de configurer tous vos rôle-play\n- ``/logs`` : Affiche la liste des dernières modifications sur les différents rôle-play\n- ``/salaire`` : Regarde le salaire des mois ainsi que d'un joueur en particulier avec un graphique ainsi que la liste de ses tâches\n- ``/rank`` : Nécessaire pour que vos joueurs soient comptés comme ayant un grade, branché avec le système de permission- ``/derank`` : Comme précédement, commandes obligatoires, elles affiches aussi une affiche et l'historique des grades",
        },
        { type: 14, spacing: 2 },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: "https://discord.gg/tFkb9nYSd8",
              label: "Discord Support",
              emoji: "1307452239052279858",
              style: 5,
            },
          ],
        },
      ],
    };

    await inviter.send({
      components: [goodContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });

    await sendLog(
      "## ✅ Accès Autorisé",
      `GloryRP a été invité par <@${
        inviter.id
      }>.\n\n> Nom : ${guild.name.replace(/\\/g, "\\\\").replace(/_/g, "\\_")}\n> Membres : ${
        guild.memberCount
      }\n> Propriétaire : <@${
        guild.ownerId
      }>\n> Date de création : <t:${Math.floor(
        guild.createdTimestamp / 1000,
      )}:R>`,
    );
  } catch (err) {
    console.error("Erreur lors du traitement de l'invitation :", err);
  }
};
