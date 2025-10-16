const {
  MessageFlags,
  SeparatorSpacingSize,
  ButtonStyle,
  AuditLogEvent,
} = require("discord.js");
const { discordStaff } = require("../../utils/functions/linkedUser.js");
const config = require("../../config.js");

module.exports = async (client, guild) => {
  try {
    const auditLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.BotAdd,
    });
    const botAddLog = auditLogs.entries.find(
      (entry) => entry.target.id === client.user.id,
    );
    const inviter = botAddLog?.executor;

    const { pseudonym, servers } = await discordStaff(inviter.id);

    const logChannel = await client.channels.fetch("1428042447665107096");

    const sendLog = async (title, content, color = config.colors.success) => {
      if (!logChannel?.isTextBased()) return;
      const container = {
        type: 17,
        accent_color: color,
        components: [
          { type: 10, content: title },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          { type: 10, content },
        ],
      };
      await logChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    };

    if (!pseudonym) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          { type: 10, content: `## :x: Compte non Lié` },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          {
            type: 10,
            content:
              "Ton compte Discord doit être lié à ton compte NationsGlory pour effectuer cette action.",
          },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          {
            type: 1,
            components: [
              {
                type: 2,
                url: "https://glorybot.fr/user/profile",
                label: "🔗 Lier son Compte",
                style: ButtonStyle.Link,
              },
            ],
          },
        ],
      };

      await guild.leave();
      await inviter.send({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });

      await sendLog(
        "## :x: Accès Refusé",
        `Tentative d'invitation par <@${inviter.id}> sur le serveur **${guild.name}**.\n> Membres : ${guild.memberCount}\n> Propriétaire : <@${guild.ownerId}>\n> Date de création : <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
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
          { type: 14, spacing: SeparatorSpacingSize.Large },
          {
            type: 10,
            content:
              "GloryRP est un robot uniquement disponible aux différents staffs de NationsGlory, il est donc formellement interdit de l'inviter sur un autre serveur Discord que ceux autorisés.",
          },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          {
            type: 1,
            components: [
              {
                type: 2,
                url: "https://discord.com/oauth2/authorize?client_id=829422257130176523",
                label: "Inviter GloryBot",
                emoji: "1360717989267378477",
                style: ButtonStyle.Link,
              },
            ],
          },
        ],
      };

      await guild.leave();
      await inviter.send({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });

      await sendLog(
        "## :x: Accès Refusé",
        `Tentative d'invitation par <@${inviter.id}> sur le serveur **${guild.name}**.\n> Membres : ${guild.memberCount}\n> Propriétaire : <@${guild.ownerId}>\n> Date de création : <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
        config.colors.error,
      );
      return;
    }

    await sendLog(
      "## ✅ Accès Autorisé",
      `GloryRP a été invité par <@${inviter.id}>.\n\n> Nom : ${guild.name.replace(
        /_/g,
        "\\_",
      )}\n> Membres : ${guild.memberCount}\n> Propriétaire : <@${
        guild.ownerId
      }>\n> Date de création : <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
    );
  } catch (err) {
    console.error("Erreur lors du traitement de l'invitation :", err);
  }
};
