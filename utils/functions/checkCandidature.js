const cheerio = require("cheerio");
const { getEmojiTete } = require("../../utils/functions/emojis.js");
const { saveServerDatas, getServerDatas } = require("./datas.js");
const config = require("../../config.js");

const moisFR = {
  janvier: 0,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
};

function parseFrenchDate(dateStr) {
  const regex =
    /(\d{1,2}) ([a-zA-Zéèêëàâäîïôöùûüç]+) (\d{4}) à (\d{2}):(\d{2})/;
  const match = dateStr.match(regex);
  if (!match) return null;
  const [, jour, mois, annee, heure, minute] = match;
  const monthIndex = moisFR[mois.toLowerCase()];
  if (monthIndex === undefined) return null;
  const date = new Date(
    Number(annee),
    monthIndex,
    Number(jour),
    Number(heure),
    Number(minute),
  );
  return Math.floor(date.getTime() / 1000);
}

async function getCandidatureContent(url, serveur) {
  try {
    const threadIdMatch = url.match(/\.([0-9]+)$/);
    const threadId = threadIdMatch ? threadIdMatch[1] : null;
    if (!threadId) return "ID du thread introuvable";

    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const contentDivs = $(
      `#thread-${threadId} .col-lg-10.py-3 .mb-2.overflow-hidden`,
    );
    if (!contentDivs.length) return "Contenu de la candidature introuvable";

    const components = [];
    let textBuffer = "";
    let totalLength = 0;
    const MAX_CHARS = 4000;

    function pushTextBuffer() {
      if (!textBuffer.trim()) return;
      const remaining = MAX_CHARS - totalLength;
      if (remaining <= 0) return;

      let textToPush = textBuffer.trim();
      if (textToPush.length > remaining) {
        textToPush = textToPush.slice(0, remaining - 3) + "...";
      }

      components.push({ type: 10, content: textToPush });
      totalLength += textToPush.length;
      textBuffer = "";
    }

    function processNode(node) {
      if (totalLength >= MAX_CHARS) return;

      if (node.type === "text") {
        textBuffer += $(node).text();
      } else if (node.name === "br") {
        textBuffer += "\n";
      } else if (node.name === "img") {
        pushTextBuffer();
        const imgUrl = $(node).attr("data-src") || $(node).attr("src");
        if (imgUrl) {
          components.push({
            type: 14,
            spacing: 1,
          });
          components.push({
            type: 12,
            items: [{ media: { url: imgUrl } }],
          });
        }
      } else if (node.children && node.children.length > 0) {
        for (let child of node.children) processNode(child);
      }
    }

    for (const contentDiv of contentDivs.toArray()) {
      processNode(contentDiv);
      textBuffer += "\n\n";
    }

    pushTextBuffer();

    components.forEach((c) => {
      if (c.type === 10) {
        c.content = c.content
          .replace(/\u00a0/g, " ")
          .replace(/\s*\n\s*/g, "\n")
          .replace(/\s{2,}/g, " ")
          .replace(/-->\s*\n\s*/g, " --> ");
      }
    });

    return {
      type: 17,
      accent_color: config.couleur[serveur],
      components,
    };
  } catch (err) {
    console.error("Erreur récupération candidature :", err);
    return "Impossible de récupérer le contenu de la candidature.";
  }
}

async function sendCandidatures(client, AllCandidatures) {
  for (const { serveur, panel, candidature } of AllCandidatures) {
    if (
      candidature.messageId &&
      candidature.badgeColor === candidature.savedBadgeColor
    )
      continue;

    const channelId = panel.channels.candidature;

    const channel = await client.channels.fetch(channelId);

    if (!channel) continue;

    try {
      const accentColor = candidature.badgeColor
        ? parseInt(candidature.badgeColor.replace("#", ""), 16)
        : 0x6f6f6f;

      const response = await fetch(
        `https://publicapi.nationsglory.fr/user/${candidature.auteur}`,
        {
          headers: {
            Authorization: `Bearer ${config.ng_token}`,
            accept: "application/json",
          },
        },
      );

      const responseDouble = await fetch(
        `https://apiv2.nationsglory.fr/plugins/api/user/all/${candidature.auteur}/check_if_unique`,
      );

      const responsePunisher = await fetch(
        `https://apiv2.nationsglory.fr/plugins/api/user/all/${candidature.auteur}/get_punisher/1`,
      );

      let doubleData = null;
      let punisherData = null;

      try {
        doubleData = await responseDouble.text();
      } catch (err) {
        doubleData = null;
      }

      try {
        punisherData = await responsePunisher.text();
      } catch (err) {
        punisherData = null;
      }

      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      const components = [
        {
          type: 10,
          content: `## Candidature ${panel.name} - [${candidature.auteur}](https://nationsglory.fr/profile/${candidature.auteur})`,
        },
        { type: 14, spacing: 1 },
        {
          type: 10,
          content: `${await getEmojiTete(
            client,
            candidature.auteur,
          )} **Auteur :** ${candidature.auteur}`,
        },
        {
          type: 10,
          content: `🗓️ **Date de création :** <t:${candidature.timestamp}:R>`,
        },
      ];

      if (data && data.servers && data.servers[serveur]) {
        const lastConnectionDate = new Date(
          data.servers[serveur].last_connection + "Z",
        );
        const lastConnectionTimestamp = Math.floor(
          lastConnectionDate.getTime() / 1000,
        );

        let seconds = parseInt(data.servers[serveur].playtime, 10);

        const years = Math.floor(seconds / (365 * 24 * 60 * 60));
        seconds %= 365 * 24 * 60 * 60;

        const months = Math.floor(seconds / (30 * 24 * 60 * 60));
        seconds %= 30 * 24 * 60 * 60;

        const days = Math.floor(seconds / (24 * 60 * 60));
        seconds %= 24 * 60 * 60;

        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;

        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        const parts = [];
        if (years) parts.push(`${years} an${years > 1 ? "s" : ""}`);
        if (months) parts.push(`${months} mois`);
        if (days) parts.push(`${days} jour${days > 1 ? "s" : ""}`);
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);
        if (seconds) parts.push(`${seconds}s`);

        const playtimeFormatted = parts.length ? parts.join(" ") : "0s";

        components.push(
          {
            type: 10,
            content: `⏱️ **Temps de Jeu ${
              serveur.charAt(0).toUpperCase() + serveur.slice(1)
            } :** ${playtimeFormatted}`,
          },
          {
            type: 10,
            content: `🔙 **Dernière Connexion ${
              serveur.charAt(0).toUpperCase() + serveur.slice(1)
            } :** <t:${lastConnectionTimestamp}:R>`,
          },
        );
      }

      if (doubleData || punisherData) {
        components.push({ type: 14, spacing: 1 });
      }

      if (doubleData) {
        const cleanedDouble = doubleData
          .split(/,|\/|;/)
          .map((d) => d.trim())
          .filter(
            (d) =>
              d &&
              !["null", "undefined", "-", "aucun", "none"].includes(
                d.toLowerCase(),
              ),
          );
        components.push({
          type: 10,
          content: `👥 **Doubles Comptes :** ${
            cleanedDouble.length > 0
              ? cleanedDouble.join(", ")
              : "Aucun double compte"
          }`,
        });
      }

      if (punisherData) {
        const sanctions = punisherData
          .split("###")
          .map((s) => s.trim())
          .filter((s) => s && s.startsWith("&7[&cPunisher&7]"));

        if (sanctions.length > 0) {
          const lastSanctionRaw = sanctions[0];
          const match = lastSanctionRaw.match(
            /&4(\w+)&7.*]&r\s+'(.+?)'\s+by &7([\w\d_]+)&r on &7(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
          );

          if (match) {
            const [, type, reason, auteur, dateStr] = match;

            const timestamp = Math.floor(
              new Date(dateStr + "Z").getTime() / 1000,
            );

            components.push({
              type: 10,
              content: `🚫 **Dernière Sanction :** ${type} : ${reason} par ${await getEmojiTete(
                client,
                auteur,
              )} ${auteur} <t:${timestamp}:R>`,
            });
          }
        }
      }

      components.push(
        { type: 14, spacing: 1 },
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `candidature_punisher-${candidature.auteur}`,
              label: "💢 Afficher le Punisher",
              style: 1,
            },
            {
              type: 2,
              custom_id: `candidature_activite-${candidature.auteur}-${serveur}`,
              label: "⌚ Afficher l'Activité",
              style: 1,
            },
          ],
        },
        { type: 14, spacing: 1 },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: candidature.lien,
              label: "🔗 Aller sur la Candidature",
              style: 5,
            },
          ],
        },
      );

      const candidatureContainer = {
        type: 17,
        accent_color: accentColor,
        components: components,
      };

      if (!candidature.messageId) {
        const candidatureDetailsContainer = await getCandidatureContent(
          candidature.lien,
          serveur,
        );

        let components;
        if (panel.roles.candidature && panel.roles.candidature.length > 0) {
          const roleText = {
            type: 10,
            content: panel.roles.candidature
              .map((val) => `<@&${val}>`)
              .join(" "),
          };
          components = [roleText, candidatureContainer];
        }

        if (channel.type === 0) {
          const sent = await channel.send({
            components,
            flags: 32768,
          });
          candidature.messageId = sent.id;
          candidature.savedBadgeColor = candidature.badgeColor;

          const thread = await sent.startThread({
            name: `Candidature ${panel.name} - ${candidature.auteur}`,
          });

          await thread.send({
            components: [candidatureDetailsContainer],
            flags: 32768,
          });
        } else if (channel.type === 15) {
          const thread = await channel.threads.create({
            name: `Candidature ${panel.name} - ${candidature.auteur}`,
            message: {
              components,
              flags: 32768,
            },
          });

          await thread.send({
            components: [candidatureDetailsContainer],
            flags: 32768,
          });

          let mainMessage;
          if (thread.appliedMessage) {
            mainMessage = thread.appliedMessage;
          } else {
            const fetched = await thread.messages.fetch({ limit: 1 });
            mainMessage = fetched.first();
          }

          if (mainMessage) {
            candidature.messageId = mainMessage.id;
            candidature.savedBadgeColor = candidature.badgeColor;
          } else {
            console.warn(
              "Impossible de récupérer le message principal du thread forum",
            );
          }
        } else {
          console.warn(`⚠️ Channel ${channelId} n'est ni texte ni forum.`);
        }
      } else if (
        candidature.messageId &&
        candidature.badgeColor !== candidature.savedBadgeColor
      ) {
        let msg = null;

        if (channel.type === 0) {
          msg = await channel.messages
            .fetch(candidature.messageId)
            .catch(() => null);
        } else if (channel.type === 15) {
          const thread = channel.threads.cache.find(
            (t) => t.id === candidature.messageId,
          );

          if (thread) {
            if (thread.appliedMessage) {
              msg = thread.appliedMessage;
            } else {
              const fetched = await thread.messages
                .fetch({ limit: 1 })
                .catch(() => null);
              msg = fetched?.first() || null;
            }
          }
        }

        if (msg) {
          await msg.edit({ components: [candidatureContainer] });
          candidature.savedBadgeColor = candidature.badgeColor;
        }
      }
    } catch (err) {
      console.error(
        `❌ Erreur envoi/édition candidature dans ${channelId}`,
        err,
      );
    }
  }

  const serveurs = [...new Set(AllCandidatures.map((c) => c.serveur))];

  for (const serveur of serveurs) {
    const data = await getServerDatas(false, serveur);

    for (const panelData of data.panels) {
      const allCandsForPanel = AllCandidatures.filter(
        (c) => c.panel.name === panelData.name && c.serveur === serveur,
      );

      panelData.candidature.save = allCandsForPanel.map((c) => ({
        titre: c.candidature.titre,
        lien: c.candidature.lien,
        auteur: c.candidature.auteur,
        timestamp: c.candidature.timestamp,
        badgeColor: c.candidature.badgeColor,
        savedBadgeColor: c.candidature.savedBadgeColor,
        messageId: c.candidature.messageId,
      }));
    }

    await saveServerDatas(false, data, serveur);
  }
}

async function fetchNewCandidatures() {
  let AllCandidatures = [];

  for (const serveur of config.liste_serveur) {
    const data = await getServerDatas(false, serveur);
    if (!data.panels) continue;

    let modified = false;

    for (const panel of data.panels) {
      const hasCandidatureLien = panel.candidature && panel.candidature.lien;
      const hasChannelCandidature =
        panel.channels && panel.channels.candidature;
      if (!hasCandidatureLien || !hasChannelCandidature || !panel.enable)
        continue;

      try {
        const response = await fetch(panel.candidature.lien);
        const html = await response.text();
        const $ = cheerio.load(html);

        let candidatures = [];

        $("tbody tr").each((i, el) => {
          const titre = $(el).find("th a.stretched-link").attr("title") || "";
          const lien = $(el).find("th a.stretched-link").attr("href") || "";
          const metaText = $(el).find("th span.small.text-muted").text().trim();
          const firstBadge = $(el).find("div.mt-1 span.badge").first();
          const badgeColor = firstBadge.length
            ? firstBadge.css("background-color") ||
              firstBadge.attr("style")?.match(/background:([^;!]+)/)?.[1]
            : null;

          const isPinned = $(el).find("i.mdi.mdi-pin").length > 0;
          if (isPinned) return;

          let auteur = "";
          let dateStr = "";
          if (metaText.startsWith("Posté par")) {
            const match = metaText.match(/^Posté par\s+(\S+)\s+le\s+(.+)$/);
            if (match) {
              auteur = match[1];
              dateStr = match[2];
            }
          }

          const timestamp = parseFrenchDate(dateStr);

          if (titre) {
            const existing = panel.candidature.save.find(
              (c) => c.lien === "https://nationsglory.fr" + lien,
            );

            const candidatureObj = {
              titre,
              lien: "https://nationsglory.fr" + lien,
              auteur,
              timestamp,
              badgeColor,
              messageId: existing?.messageId || null,
              savedBadgeColor: existing?.savedBadgeColor || badgeColor || null,
            };

            candidatures.push(candidatureObj);

            AllCandidatures.push({
              serveur: serveur,
              panel: panel,
              candidature: candidatureObj,
            });
          }
        });

        if (!panel.candidature.save) panel.candidature.save = [];

        for (const cand of candidatures) {
          const existing = panel.candidature.save.find(
            (c) => c.lien === cand.lien,
          );
          if (existing) {
            existing.badgeColor = cand.badgeColor;
            existing.timestamp = cand.timestamp;
            modified = true;
          } else {
            panel.candidature.save.push(cand);
            modified = true;
          }
        }
      } catch (err) {
        console.error(
          `❌ Erreur fetch candidatures ${panel.candidature.lien}`,
          err.message,
        );
      }
    }

    if (modified) {
      await saveServerDatas(false, data, serveur);
    }
  }

  return AllCandidatures;
}

async function checkCandidature(client) {
  const AllCandidatures = await fetchNewCandidatures();
  await sendCandidatures(client, AllCandidatures);
}

module.exports = { checkCandidature };
