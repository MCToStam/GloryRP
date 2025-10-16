const fs = require("node:fs");
const path = require("node:path");
const cheerio = require("cheerio");
const { getEmojiTete } = require("../../utils/functions/emojis.js");
const config = require("../../config.js");
const {
  MessageFlags,
  SeparatorSpacingSize,
  ButtonStyle,
} = require("discord.js");

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
  const regex = /(\d{1,2}) (\w+) (\d{4}) à (\d{2}):(\d{2})/;
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
    Number(minute)
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

    const contentDiv = $(
      `#thread-${threadId} .col-lg-10.py-3 > .mb-2.overflow-hidden`
    ).first();
    if (!contentDiv.length) return "Contenu de la candidature introuvable";

    const components = [];
    const children = contentDiv.contents().toArray();
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

    for (let child of children) {
      if (totalLength >= MAX_CHARS) break;

      if (child.type === "text") {
        textBuffer += $(child).text();
      } else if (child.name === "br") {
        textBuffer += "\n";
      } else if (
        child.name === "span" ||
        child.name === "div" ||
        child.name === "p"
      ) {
        const imgs = $(child).find("img").toArray();
        const text = $(child).clone().children("img").remove().end().text();
        if (text) textBuffer += text + "\n";

        if (imgs.length > 0) {
          pushTextBuffer();
          for (let img of imgs) {
            if (totalLength >= MAX_CHARS) break;
            const imgUrl = $(img).attr("data-src") || $(img).attr("src");
            if (imgUrl) {
              components.push({
                type: 14,
                spacing: SeparatorSpacingSize.Small,
              });
              components.push({
                type: 12,
                items: [{ media: { url: imgUrl } }],
              });
            }
          }
        }
      }
    }

    pushTextBuffer();

    components.forEach((c) => {
      if (c.type === 10) {
        c.content = c.content.replace(/\u00a0/g, " ");
        c.content = c.content.replace(/\s*\n\s*/g, "\n");
        c.content = c.content.replace(/\s{2,}/g, " ");
        c.content = c.content.replace(/-->\s*\n\s*/g, " --> ");
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
    const channelId = panel.channels.candidature;

    let channel;
    try {
      channel = await client.channels.fetch(channelId);
    } catch (e) {
      console.log("Impossible de fetch le salon:", e.message);
    }

    if (!channel) {
      console.log("Salon introuvable malgré le fetch");
      continue;
    }

    try {
      const accentColor = candidature.badgeColor
        ? parseInt(candidature.badgeColor.replace("#", ""), 16)
        : 0x6f6f6f;

      const candidatureContainer = {
        type: 17,
        accent_color: accentColor,
        components: [
          {
            type: 10,
            content: `## Candidature ${panel.name} - [${candidature.auteur}](https://nationsglory.fr/profile/${candidature.auteur})`,
          },
          { type: 14, spacing: SeparatorSpacingSize.Small },
          {
            type: 10,
            content: `${await getEmojiTete(
              client,
              candidature.auteur
            )} **Auteur :** ${candidature.auteur}`,
          },
          {
            type: 10,
            content: `🗓️ **Date de création :** <t:${candidature.timestamp}:R>`,
          },
          { type: 14, spacing: SeparatorSpacingSize.Small },
          {
            type: 1,
            components: [
              {
                type: 2,
                url: candidature.lien,
                label: "Aller sur la Candidature",
                style: ButtonStyle.Link,
              },
            ],
          },
        ],
      };

      const isNew = !candidature.messageId;
      if (isNew) {
        const candidatureDetailsContainer = await getCandidatureContent(
          candidature.lien,
          serveur
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
            flags: MessageFlags.IsComponentsV2,
          });
          candidature.messageId = sent.id;
          candidature.savedBadgeColor = candidature.badgeColor;

          const thread = await sent.startThread({
            name: `Candidature ${panel.name} - ${candidature.auteur}`,
          });

          await thread.send({
            components: [candidatureDetailsContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        } else if (channel.type === 15) {
          const thread = await channel.threads.create({
            name: `Candidature ${panel.name} - ${candidature.auteur}`,
            message: {
              components,
              flags: MessageFlags.IsComponentsV2,
            },
          });

          await thread.send({
            components: [candidatureDetailsContainer],
            flags: MessageFlags.IsComponentsV2,
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
              "Impossible de récupérer le message principal du thread forum"
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
            (t) => t.id === candidature.messageId
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
        err
      );
    }
  }

  const baseDir = path.join(__dirname, "..", "..", "data", "servers");

  const serveurs = [...new Set(AllCandidatures.map((c) => c.serveur))];

  for (const serverFile of serveurs) {
    const filePath = path.join(baseDir, `${serverFile}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const panelData of data.panels) {
      const allCandsForPanel = AllCandidatures.filter(
        (c) => c.panel.name === panelData.name && c.serveur === serverFile
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

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}

async function fetchNewCandidatures() {
  const baseDir = path.join(__dirname, "..", "..", "data", "servers");
  let AllCandidatures = [];

  for (const serverFile of config.liste_serveur) {
    const filePath = path.join(baseDir, `${serverFile}.json`);

    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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
              (c) => c.lien === "https://nationsglory.fr" + lien
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
              serveur: serverFile,
              panel: panel,
              candidature: candidatureObj,
            });
          }
        });

        if (!panel.candidature.save) panel.candidature.save = [];

        for (const cand of candidatures) {
          const existing = panel.candidature.save.find(
            (c) => c.lien === cand.lien
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
          err.message
        );
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  }

  return AllCandidatures;
}

async function checkCandidature(client) {
  const AllCandidatures = await fetchNewCandidatures();
  await sendCandidatures(client, AllCandidatures);
}

module.exports = { checkCandidature };
