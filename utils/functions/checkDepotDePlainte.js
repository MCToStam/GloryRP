const config = require("../../config.js");
const cheerio = require("cheerio");
const { getEmojiTete } = require("../../utils/functions/emojis.js");
const { saveServerDatas, getServerDatas } = require("./datas.js");

async function fetchNewMessages(urlLien, savedIds, lastTimestamp) {
  const newMessages = [];
  const savedSet = new Set(savedIds.map(String));

  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const pageUrl = urlLien.endsWith("/")
      ? `${urlLien}${page}`
      : `${urlLien}/${page}`;

    try {
      const response = await fetch(pageUrl);
      if (!response.ok) {
        break;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      if ($(".card-body").length === 0) {
        break;
      }

      $(".card-body").each((i, el) => {
        let idAttr = $(el).attr("id") || "";
        let id = null;

        if (idAttr) {
          const m = idAttr.match(/(?:thread-)?(\d+)/);
          if (m) id = m[1];
        }

        if (!id) {
          const aWithMsgId = $(el).find("a[message-id]").first();
          if (aWithMsgId.length) id = aWithMsgId.attr("message-id");
        }

        const auteur = $(el).find(".col-lg-2 h2 a").first().text().trim();
        if (!id || !auteur) return;

        if (savedSet.has(String(id))) return;

        const timeEl = $(el).find(".small.text-muted.mb-4").first();
        let timestamp = null;

        if (timeEl.length) {
          const text = timeEl.text().trim();
          const match = text.match(
            /Posté le (\d{1,2}) (\w+) (\d{4}) à (\d{2}):(\d{2})/i,
          );

          if (match) {
            const [_, day, monthFr, year, hour, minute] = match;

            const months = {
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
            const month = months[monthFr.toLowerCase()];

            if (month !== undefined) {
              const date = new Date(year, month, day, hour, minute);
              timestamp = Math.floor(date.getTime() / 1000);
            }
          }
        }

        const now = Math.floor(Date.now() / 1000);
        const delay45min = 45 * 60;

        if (lastTimestamp) {
          if (timestamp <= lastTimestamp) return;
        } else {
          if (now - timestamp > delay45min) return;
        }

        let lien = null;
        if (idAttr) {
          lien = urlLien.replace(/\/$/, "") + "#" + idAttr;
        } else {
          const linkEl = $(el).find("a[message-id]").first();
          if (linkEl.length)
            lien =
              urlLien.replace(/\/$/, "") +
              "/" +
              page +
              "#answer-" +
              linkEl.attr("message-id");
        }

        newMessages.push({ id: String(id), auteur, timestamp, lien });
      });

      const nextLinkExists = $("a[aria-label='Suivant']").length > 0;

      hasNextPage = nextLinkExists && $(".card-body").length > 0;

      page++;
    } catch (err) {
      console.error(`Erreur sur la page ${pageUrl}:`, err);
      break;
    }
  }

  return newMessages;
}

async function checkDepotDePlainte(client) {
  for (const serveur of config.liste_serveur) {
    const data = await getServerDatas(false, serveur);

    if (!Array.isArray(data.panels)) continue;

    let hasChanges = false;

    for (const panel of data.panels) {
      const hasDepotLien = panel.depotdeplainte && panel.depotdeplainte.lien;
      const hasChannelDepot = panel.channels && panel.channels.depotdeplainte;

      if (!hasDepotLien || !hasChannelDepot || !panel.enable) continue;

      const channelId = panel.channels.depotdeplainte;

      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) continue;

      if (!Array.isArray(panel.depotdeplainte.save))
        panel.depotdeplainte.save = [];

      let lastTimestamp = null;
      if (panel.depotdeplainte.save.length > 0) {
        lastTimestamp = panel.depotdeplainte.save.reduce((max, msg) => {
          return msg.timestamp && msg.timestamp > max ? msg.timestamp : max;
        }, 0);
      }

      const nouveauxMessages = await fetchNewMessages(
        panel.depotdeplainte.lien,
        panel.depotdeplainte.save.map((m) => m.id),
        lastTimestamp,
      );

      if (nouveauxMessages.length > 0) {
        panel.depotdeplainte.save.push(...nouveauxMessages);
        hasChanges = true;
      }

      let pinged = false;

      for (const plainte of nouveauxMessages) {
        let components = [];

        const depotdeplainteContainer = {
          type: 17,
          accent_color: config.couleur[serveur],
          components: [
            {
              type: 10,
              content: `## Nouvelle Plainte`,
            },
            { type: 14, spacing: 1 },
            {
              type: 10,
              content: `${await getEmojiTete(
                client,
                plainte.auteur,
              )} **Auteur :** ${plainte.auteur}`,
            },
            {
              type: 10,
              content: `🗓️ **Date de création :** <t:${plainte.timestamp}:R>`,
            },
            { type: 14, spacing: 1 },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  url: plainte.lien,
                  label: "Aller sur le Dépot de Plainte",
                  style: 5,
                },
              ],
            },
          ],
        };

        if (!pinged && panel.roles.depotdeplainte.length !== 0) {
          const roleText = {
            type: 10,
            content: panel.roles.depotdeplainte
              .map((val) => `<@&${val}>`)
              .join(" "),
          };

          pinged = true;
          components = [roleText, depotdeplainteContainer];
        } else {
          components = [depotdeplainteContainer];
        }

        await channel.send({
          components,
          flags: 32768,
        });
      }
    }

    if (hasChanges) {
      try {
        await saveServerDatas(false, data, serveur);
      } catch (err) {
        console.error(
          `Erreur lors de la sauvegarde du fichier ${serveur}:`,
          err,
        );
      }
    }
  }
}

module.exports = { checkDepotDePlainte };
