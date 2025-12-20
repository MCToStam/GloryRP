const config = require("../../config.js");
const { getEmojiTete } = require("../../utils/functions/emojis.js");
const { getServerDatas } = require("../../utils/functions/datas.js");

function createErrorBox(msg) {
  return {
    type: 17,
    accent_color: config.colors.error,
    components: [
      { type: 10, content: "## :no_entry_sign: Erreur" },
      { type: 14, spacing: 2 },
      { type: 10, content: msg },
    ],
  };
}

function createPanel(title, content, color) {
  return {
    type: 17,
    accent_color: color,
    components: [
      { type: 10, content: `## ${title}` },
      { type: 14, spacing: 2 },
      { type: 10, content },
    ],
  };
}

function formatDateFr(date) {
  const [moisStr, annee] = date.split("_");
  const mois =
    [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ][parseInt(moisStr, 10) - 1] || moisStr;

  return `${mois} ${annee}`;
}

async function computeSalaire(emojiCache, salaireData, date, client, panel) {
  const result = [];

  for (const [joueur, data] of Object.entries(salaireData)) {
    const mois = data[date];
    if (!mois) continue;

    const taches = mois.taches.filter(
      (t) => t.status !== "waiting" && t.status !== "refused",
    );

    const total = taches.reduce((a, t) => a + (t.argent || 0), 0);
    if (total === 0) continue;

    if (!emojiCache[joueur]) {
      try {
        emojiCache[joueur] = (await getEmojiTete(client, joueur)).toString();
      } catch {
        emojiCache[joueur] = "";
      }
    }

    result.push({
      joueur,
      total,
      emoji: emojiCache[joueur],
      cmdDon: panel.salaire.cmd_don
        .replace("[argent]", total)
        .replace("[joueur]", joueur),
    });
  }

  return result;
}

async function salairePost(client, serveur, serveurDatas, panelId, date) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);
  const salaireData = panel.salaire?.salaire || {};

  const dateExiste = Object.values(salaireData).some((s) => s[date]);

  if (!dateExiste) {
    return createErrorBox(
      `Aucun salaire enregistré pour "**${formatDateFr(date)}**" dans **${
        panel.name
      }**.`,
    );
  }

  const channel = client.channels.cache.get(panel.channels.salaire);
  if (!channel) {
    return createErrorBox(
      `Le salon du panel **${panel.name}** n'est pas valide.`,
    );
  }

  const emojiCache = {};
  const listeSalaires = await computeSalaire(
    emojiCache,
    salaireData,
    date,
    client,
    panel,
  );

  const texte = listeSalaires
    .map((s) => `${s.emoji} **${s.joueur}** : ${s.total}$`)
    .join("\n");

  const panelMessage = await channel.send({
    components: [
      ...(panel.roles.salaire?.length
        ? [
            {
              type: 10,
              content: panel.roles.salaire.map((r) => `<@&${r}>`).join(" "),
            },
          ]
        : []),
      createPanel(
        `${panel.emoji ? panel.emoji + " " : ""}Salaires ${
          panel.name
        } - ${formatDateFr(date)}`,
        texte,
        config.couleur[serveur],
      ),
    ],
    flags: 32768,
    allowedMentions: { parse: [] },
  });

  if (channel.type === 5) {
    await panelMessage.crosspost();
  }

  if (panel.channels.cmd_salaire) {
    const responsableChannel = client.channels.cache.get(
      panel.channels.cmd_salaire,
    );
    if (responsableChannel) {
      const totalServeur = listeSalaires.reduce((a, s) => a + s.total, 0);

      const cmdRetrait = `> 🌐 \`\`${panel.salaire.cmd_retrait.replace(
        "[argent]",
        totalServeur,
      )}\`\``;

      const commandes = [
        cmdRetrait,
        ...listeSalaires.map((s) => `\n> ${s.emoji} \`\`${s.cmdDon}\`\``),
      ].join("\n");

      const respMessage = await responsableChannel.send({
        components: [
          createPanel(
            `${panel.emoji ? panel.emoji + " " : ""}Salaires ${
              panel.name
            } - ${formatDateFr(date)}`,
            commandes,
            config.couleur[serveur],
          ),
        ],
        flags: 32768,
        allowedMentions: { parse: [] },
      });

      if (responsableChannel.type === 5) {
        await respMessage.crosspost();
      }
    }
  }

  return createPanel(
    ":white_check_mark: Salaire Envoyé",
    `Salaire du mois "**${formatDateFr(date)}**" pour **${
      panel.name
    }** envoyé ici :${panelMessage.url}`,
    config.colors.success,
  );
}

async function salaireAutomatique(client) {
  const d = new Date();
  const date = `${String(d.getMonth()).padStart(2, "0")}_${d.getFullYear()}`;

  for (const serveur of config.liste_serveur) {
    const datas = await getServerDatas(false, serveur);
    for (const panel of datas.panels) {
      if (panel.salaire?.automatique) {
        await salairePost(client, serveur, datas, panel.id, date);
      }
    }
  }
}

module.exports = { salairePost, formatDateFr, salaireAutomatique };
