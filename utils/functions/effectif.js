const { getEmojiTete } = require("../../utils/functions/emojis.js");
const { discordLink } = require("../../utils/functions/linkedUser.js");
const config = require("../../config.js");
const { saveServerDatas } = require("./datas.js");

function sortGrades(panel) {
  return [...panel.grade].sort((a, b) => Number(b.tier) - Number(a.tier));
}

async function buildEffectifContent(client, grades, ngData) {
  let content = "";

  for (const grade of grades) {
    const joueurs = grade.listeRp || [];
    const mentions = [];

    for (const joueur of joueurs) {
      const pseudo = ngData.data[joueur];

      if (pseudo) {
        const emojiTete = await getEmojiTete(client, pseudo).catch(() => "");
        mentions.push(`${emojiTete} <@${joueur}> ➤ ${pseudo}`);
      } else {
        mentions.push(`<@${joueur}>`);
      }
    }

    const finalMentions = mentions.length
      ? mentions.join("\n")
      : "*Ce grade est vide*";

    content += `**${grade.nom} (${joueurs.length}) :**\n${finalMentions}\n\n`;
  }

  return content;
}

function buildEffectifContainer(serveur, panel, effectifContent, buttons = []) {
  const container = {
    type: 17,
    accent_color: config.couleur[serveur],
    components: [
      {
        type: 10,
        content: `## ${panel.emoji ? `${panel.emoji} ` : ""}${panel.name}`,
      },
      { type: 14, spacing: 2 },
      { type: 10, content: effectifContent },
    ],
  };

  if (buttons.length > 0) {
    container.components.push(
      { type: 14, spacing: 2 },
      { type: 1, components: buttons },
    );
  }

  return container;
}

function buildButtons(panel) {
  return (
    panel.effectif.button?.map((b) => ({
      type: 2,
      style: 5,
      label: b.label,
      url: b.lien,
    })) || []
  );
}

function errorResponse(text) {
  return {
    type: 17,
    accent_color: config.colors.error,
    components: [
      { type: 10, content: "## :no_entry_sign: Erreur" },
      { type: 14, spacing: 2 },
      { type: 10, content: text },
    ],
  };
}

async function sendEffectif(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);

  if (!panel?.grade?.length) {
    return errorResponse(
      `Le rôle-play **${panel.name}** n’a aucun grade défini.`,
    );
  }

  const channelId = panel.channels.effectif;
  if (!channelId) {
    return errorResponse(
      `Le rôle-play **${panel.name}** n’a aucune salon d'effectif défini.`,
    );
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return errorResponse(
      `Le salon d'effectif du rôle-play **${panel.name}** n'est pas valide.`,
    );
  }

  const ngData = await discordLink();
  const gradesTriees = sortGrades(panel);
  const effectifContent = await buildEffectifContent(
    client,
    gradesTriees,
    ngData,
  );

  const buttons = buildButtons(panel);
  const effectifContainer = buildEffectifContainer(
    serveur,
    panel,
    effectifContent,
    buttons,
  );

  const message = await channel.send({
    components: [effectifContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });

  panel.effectif.message = message.id;
  panel.effectif.channel = message.channelId;
  panel.effectif.guild = message.guildId;

  await saveServerDatas(false, serveurDatas, serveur);

  return {
    type: 17,
    accent_color: config.colors.success,
    components: [
      { type: 10, content: "## :white_check_mark: Effectif Envoyé" },
      { type: 14, spacing: 2 },
      {
        type: 10,
        content: `L'effectif du rôle-play **${panel.name}** a correctement été envoyé ici : ${message.url}`,
      },
    ],
  };
}

async function updateEffectif(client, serveur, serveurDatas, panelId) {
  const panel = serveurDatas.panels.find((p) => p.id === Number(panelId));
  if (!panel?.effectif?.message || !panel.effectif.channel) return;

  const channel = client.channels.cache.get(panel.effectif.channel);
  if (!channel) return;

  const message = await channel.messages
    .fetch(panel.effectif.message)
    .catch(() => null);
  if (!message) return;

  const ngData = await discordLink();
  const gradesTriees = sortGrades(panel);
  const effectifContent = await buildEffectifContent(
    client,
    gradesTriees,
    ngData,
  );

  const buttons = buildButtons(panel);
  const effectifContainer = buildEffectifContainer(
    serveur,
    panel,
    effectifContent,
    buttons,
  );

  await message.edit({
    components: [effectifContainer],
    allowedMentions: { parse: [] },
  });
}

module.exports = { sendEffectif, updateEffectif };
