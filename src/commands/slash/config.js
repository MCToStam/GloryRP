const { InteractionContextType, MessageFlags } = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getConfigContainer } = require("../../../components/containers.js");
const { discordStaff } = require("../../../utils/functions/linkedUser.js");

exports.run = async (client, interaction, config) => {
  const serv = interaction.options.getString("serveur").toLowerCase();

  const serverDatas = await getServerDatas(interaction, serv);
  const configContainer = await getConfigContainer(serverDatas, serv);
  return interaction.reply({
    components: [configContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "config",
  description: "Configure le rôle-play de ton serveur",
  options: [
    {
      type: 3,
      name: "serveur",
      description: "Serveur que tu souhaites configurer",
      autocomplete: true,
      required: true,
    },
  ],
  contexts: [InteractionContextType.Guild],
  async autocomplete(client, interaction, config) {
    const { pseudonym, servers } = await discordStaff(interaction.user.id);

    if (!pseudonym) {
      return interaction.respond([
        {
          name: "Compte NationsGlory non lié, fais-le maintenant : https://glorybot.fr",
          value: "non-lie",
        },
      ]);
    }

    if (!servers || servers.length === 0) {
      return interaction.respond([
        {
          name: "Vous n'êtes opérateur d'aucun serveur de NationsGlory.",
          value: "permission",
        },
      ]);
    }

    const focusedValue = interaction.options.getFocused()?.toLowerCase() ?? "";
    const filtered = servers
      .filter((serv) => serv.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map((serv) => ({
        name: serv.charAt(0).toUpperCase() + serv.slice(1),
        value: serv,
      }));

    await interaction.respond(filtered);
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
