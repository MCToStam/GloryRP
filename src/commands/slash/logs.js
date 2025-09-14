const config = require('../../../config.js');
const { InteractionContextType, MessageFlags } = require('discord.js');
const { getGuildDatas } = require('../../../utils/functions/datas.js');
const { getlogContainer } = require('../../../components/logContainer.js');

exports.run = async (client, interaction, config) => {
    const serv = interaction.options.getString('serveur').toLowerCase();
    const panel = interaction.options.getString('panel').toLowerCase();
    if (!config.liste_serveur.includes(serv)) {
        const servers =
            config.liste_serveur.slice(0, 2).join(', ') +
            '\n' +
            config.liste_serveur.slice(2, 10).join(', ') +
            '\n' +
            config.liste_serveur.slice(10).join(', ');
        const unknowServerContainer = {
            type: 17,
            accent_color: config.colors.error,
            components: [
                {
                    type: 10,
                    content: '### :question: Serveur Inconnus - "' + serv + '"',
                },
                {
                    type: 14,
                    spacing: 1,
                },
                {
                    type: 10,
                    content: 'Tu dois préciser un serveur existant : ' + servers,
                },
            ],
        };
        return interaction.reply({ components: [unknowServerContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const guildDatas = await getGuildDatas(interaction);
    const logContainer = await getlogContainer(guildDatas, panel, serv, 1);
    return interaction.reply({ components: [logContainer], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
};

exports.data = {
    name: 'logs',
    description: 'Affiche les logs des modifications des panels rôle-play',
    options: [
        {
            type: 3,
            name: 'serveur',
            description: 'Serveur sur lequel voir les logs',
            autocomplete: true,
            required: true,
        },
        {
            type: 3,
            name: 'panel',
            description: 'Panel sur lequel voir les logs',
            autocomplete: true,
            required: true,
            choices: Object.entries(config.panels).map(([key, value]) => ({
                name: `${value.emoji} ${value.name.charAt(0).toUpperCase() + value.name.slice(1)}`,
                value: key,
            })),
        },
    ],
    contexts: [InteractionContextType.Guild],
    async autocomplete(client, interaction, config) {
        const response = await fetch(config.glorystaff_url + '/api/get-staff?discordId=' + interaction.user.id);
        const servers = await response.json();
        const respondDatas = [];
        for (serv of servers) {
            const servname = serv.charAt(0).toUpperCase() + serv.slice(1);
            respondDatas.push({ name: servname, value: serv });
        }
        await interaction.respond(respondDatas);
    },
};

exports.conf = {
    cooldown: 5,
    enabled: true,
    category: '⚙ Configuration',
};