const { getlogContainer } = require('../../components/logContainer.js');
const { getGuildDatas } = require('../../utils/functions/datas.js');
const { MessageFlags } = require('discord.js');

exports.run = async (client, interaction) => {
    await interaction.deferUpdate();

    const [action, type, serv, currentPage, panel] = interaction.customId.split('-');
    let page = parseInt(currentPage, 10);

    if (type === "prev") {
        page = Math.max(1, page - 1);
    } else if (type === "next") {
        page = page + 1;
    }

    const guildDatas = await getGuildDatas(interaction);

    const logContainer = await getlogContainer(guildDatas, panel, serv, page);

    await interaction.message.edit({
        components: [logContainer],
        allowedMentions: { parse: [] },
        flags: MessageFlags.IsComponentsV2
    });
};

exports.data = {
    name: 'logs',
};

exports.conf = {
    type: 'Button',
};