const { getServerDatas } = require("../../../utils/functions/datas.js");
const { getPanierContainer } = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const boutiqueContainer = await getPanierContainer(
    guildColor,
    boutiqueId,
    interaction.user.id,
    boutiqueDatas,
    client,
  );

  await interaction.update({
    components: [boutiqueContainer],
    allowedMentions: { parse: [] },
  });
};

exports.data = { name: "boutique_panier_afficher" };
