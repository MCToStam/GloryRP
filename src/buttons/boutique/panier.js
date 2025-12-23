const { getServerDatas } = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);
  const categorieId = Number(interaction.customId.split("-")[3]);
  const articleId = Number(interaction.customId.split("-")[4]);
  const action = interaction.customId.split("-")[5];

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((b) => b.id === boutiqueId);

  const userPanier = boutiqueDatas.panier.find(
    (p) => p.memberId === interaction.user.id,
  );

  const articlePanier = userPanier?.article.find((a) => a.id === articleId);

  const valeurDefault = articlePanier
    ? String(articlePanier.quantite)
    : undefined;

  const modal = {
    custom_id: `boutique_panier-${guildColor}-${boutiqueId}-${categorieId}-${articleId}-${action}`,
    title: "Quantité de l'Article",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "quantite",
            label: "Quantité de l'article à acheter",
            style: 1,
            min_length: 1,
            max_length: 5,
            placeholder: "Ex: 64",
            ...(valeurDefault ? { value: valeurDefault } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "boutique_panier" };
