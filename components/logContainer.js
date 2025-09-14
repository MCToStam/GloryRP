const config = require('../config.js');
const { SeparatorSpacingSize, time, userMention, ButtonStyle } = require('discord.js');

async function getlogContainer(guildDatas, panel, serv, page = 1) {
    const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
    const logs = (guildDatas.logs || []).filter((log) => log.panel === panel);

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
                return `- ${userMention(log.user)} : **${log.action}** ${await time(log.timestamp, 'R')}`;
            })
        );
    }

    const panelInfo = config.panels[panel];
    const panelLabel = panelInfo ? panelInfo.name.charAt(0).toUpperCase() + panelInfo.name.slice(1) : panel;

    return {
        type: 17,
        accent_color: config.couleur[serv],
        components: [
            {
                type: 10,
                content: '## 📝 Logs du Role-Play ' + servName + " - " + panelLabel,
            },
            {
                type: 14,
                spacing: SeparatorSpacingSize.Large,
            },
            {
                type: 10,
                content: logLines.join('\n'),
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
                        custom_id: `logs-prev-${serv}-${page}-${panel}`,
                        label: '⬅️',
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
                        custom_id: `logs-next-${serv}-${page}-${panel}`,
                        label: '➡️',
                        style: ButtonStyle.Primary,
                        disabled: page >= totalPages,
                    },
                ],
            },
        ],
    };
}

module.exports = { getlogContainer };