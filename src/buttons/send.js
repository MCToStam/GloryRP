const { getGuildDatas } = require('../../utils/functions/datas.js');
const { userMention } = require('discord.js');
const { MessageFlags } = require('discord.js');
exports.run = async (client, interaction, config) => {
	const panel = interaction.customId.split('-')[2];
	const realPanelName = config.panels[panel].name;
	const panelName = realPanelName.charAt(0).toUpperCase() + realPanelName.slice(1);

	const guildDatas = await getGuildDatas(interaction);
	const panelDatas = guildDatas.panels.find((x) => x.id === panel);
	const panelChannel = interaction.guild.channels.cache.get(panelDatas.channel);

	panelChannel.send(userMention(interaction.user.id) + " t'as une p'tite bite ! 😛").then(
		interaction.reply({
			content: ':white_check_mark: **| Le panel ' + panelName + ' a bien été envoyé !**',
			flags: MessageFlags.Ephemeral,
		})
	);
};

exports.data = {
	name: 'send',
};

exports.conf = {
	type: 'User',
};
