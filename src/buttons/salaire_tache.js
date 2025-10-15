const { MessageFlags } = require("discord.js");
const { getServerDatas } = require("../../utils/functions/datas.js");
const {
  getJoueurTacheContainer,
} = require("../../components/salaireContainer.js");

exports.run = async (client, interaction, config) => {
  const [_, joueur, panelId, serv, date, first] = interaction.customId.split("-");
  const serverDatas = await getServerDatas(interaction, serv);

  const { error, component: salaireContainer } = await getJoueurTacheContainer(
    client,
    joueur,
    serverDatas,
    panelId,
    serv,
    date
  );

  if (first) {
    return interaction.reply({
      components: [salaireContainer],
      flags: error
        ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        : MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  } else {
    return interaction.update({
      components: [salaireContainer],
      flags: error
        ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        : MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "salaire_tache",
};

exports.conf = {
  type: "User",
};
