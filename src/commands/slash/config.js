const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers");
const proxyCommande = require("../../../utils/functions/proxyCmd");

exports.run = async (client, interaction, config) => {
  await proxyCommande(client, interaction, config);
};

exports.proxy = async (client, interaction, config) => {
  const { serveur } = interaction.parametre;

  const serverDatas = await getServerDatas(interaction, serveur);
  const configContainer = await getConfigContainer(serverDatas, serveur);

  if (interaction.isMessageComponent()) {
    return interaction.update({
      components: [configContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } else {
    return interaction.reply({
      components: [configContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "config",
  description: "Configure le rôle-play de ton serveur",
  options: [],
  contexts: [0],
  async autocomplete(client, interaction, config) {},
};

exports.conf = {
  cooldown: 5,
  enabled: true,
};
