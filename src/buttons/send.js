const { getServerDatas } = require("../../utils/functions/datas.js");
const { userMention } = require("discord.js");
const { MessageFlags } = require("discord.js");
exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const panelChannel = interaction.guild.channels.cache.get(panelDatas.channel);

  panelChannel
    .send(userMention(interaction.user.id) + " t'as une p'tite bite ! 😛")
    .then(
      interaction.reply({
        content:
          ":white_check_mark: **| Le panel " +
          panelName +
          " a bien été envoyé !**",
        flags: MessageFlags.Ephemeral,
      })
    );
};

exports.data = {
  name: "send",
};

exports.conf = {
  type: "User",
};
