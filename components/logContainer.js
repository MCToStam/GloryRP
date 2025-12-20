const config = require("../config");

async function getLogContainer(serverDatas, panel, serv, page, type) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelId = Number(panel);

  const panelInfo =
    type === "panel"
      ? serverDatas.panels.find((p) => p.id === panelId)
      : serverDatas.boutiques.find((p) => p.id === panelId);
  if (!panelInfo) {
    return {
      error: true,
      component: {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry: Panel Introuvable",
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content: `Le panel **${panel}** n'existe pas.`,
          },
        ],
      },
    };
  }

  const logs = (serverDatas.logs || []).filter((log) => log[type] === panelId);

  const logsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

  page = Math.min(Math.max(page, 1), totalPages);

  const start = (page - 1) * logsPerPage;
  const end = start + logsPerPage;
  const pageLogs = logs.slice().reverse().slice(start, end);

  let logLines;
  if (pageLogs.length === 0) {
    logLines = ["> :x: Aucun log trouvé pour ce serveur."];
  } else {
    logLines = await Promise.all(
      pageLogs.map((log) => {
        return `- <@${log.user}> : **${log.action}** <t:${log.timestamp}:R>`;
      }),
    );
  }

  const panelLabel = panelInfo.name;

  return {
    error: false,
    component: {
      type: 17,
      accent_color: config.couleur[serv],
      components: [
        {
          type: 10,
          content: `## 📝 Logs ${
            type === "panel" ? "du Role-Play" : "de la Boutique"
          } ${servName} - ${panelLabel}`,
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content: logLines.join("\n"),
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
              custom_id: `logs-prev-${panelId}-${serv}-${page}-${type}`,
              label: "⬅️",
              style: 1,
              disabled: page <= 1,
            },
            {
              type: 2,
              custom_id: "logs-status",
              label: `Page ${page}/${totalPages}`,
              style: 2,
              disabled: true,
            },
            {
              type: 2,
              custom_id: `logs-next-${panelId}-${serv}-${page}-${type}`,
              label: "➡️",
              style: 1,
              disabled: page >= totalPages,
            },
          ],
        },
      ],
    },
  };
}

module.exports = { getLogContainer };
