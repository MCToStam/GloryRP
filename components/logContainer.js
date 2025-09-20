const config = require("../config.js");
const {
  SeparatorSpacingSize,
  time,
  userMention,
  ButtonStyle,
} = require("discord.js");

async function getlogContainer(serverDatas, panel, serv, page = 1) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelId = Number(panel);

  const panelInfo = serverDatas.panels.find((p) => p.id === panelId);
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
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Le panel **${panel}** n'existe pas.`,
          },
        ],
      },
    };
  }

  const logs = (serverDatas.logs || []).filter((log) => log.panel === panelId);

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
      pageLogs.map(async (log) => {
        return `- ${userMention(log.user)} : **${log.action}** ${await time(
          log.timestamp,
          "R"
        )}`;
      })
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
          content: "## 📝 Logs du Role-Play " + servName + " - " + panelLabel,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: logLines.join("\n"),
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
              custom_id: `logs-prev-${serv}-${page}-${panelId}`,
              label: "⬅️",
              style: ButtonStyle.Primary,
              disabled: page <= 1,
            },
            {
              type: 2,
              custom_id: "logs-status",
              label: `Page ${page}/${totalPages}`,
              style: ButtonStyle.Secondary,
              disabled: true,
            },
            {
              type: 2,
              custom_id: `logs-next-${serv}-${page}-${panelId}`,
              label: "➡️",
              style: ButtonStyle.Primary,
              disabled: page >= totalPages,
            },
          ],
        },
      ],
    },
  };
}

module.exports = { getlogContainer };