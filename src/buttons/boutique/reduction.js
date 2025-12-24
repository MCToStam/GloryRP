const {
  getServerDatas,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const { getPanierContainer } = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  const action = interaction.customId.split("-")[1];
  const guildColor = interaction.customId.split("-")[2];
  const boutiqueId = Number(interaction.customId.split("-")[3]);
  const reductionId = Number(interaction.customId.split("-")[4]);

  if (action === "remove") {
    const serverDatas = await getServerDatas(interaction, guildColor);
    const boutiqueDatas = serverDatas.boutiques.find(
      (x) => x.id === boutiqueId,
    );

    const panier = boutiqueDatas.panier.find(
      (p) => p.memberId === interaction.user.id,
    );

    panier.reduction = panier.reduction.filter((id) => id !== reductionId);
    saveServerDatas(interaction, serverDatas, guildColor);

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
  } else if (action === "add") {
    const modal = {
      custom_id: `boutique_reduction-${guildColor}-${boutiqueId}`,
      title: "Code de Réduction",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "code",
              label: "Code de réduction",
              style: 1,
              min_length: 1,
              max_length: 100,
              placeholder: "Ex: BLACKFRYDAY2025",
              required: true,
            },
          ],
        },
      ],
    };

    await interaction.showModal(modal);
  }
};

exports.data = { name: "boutique_reduction" };
