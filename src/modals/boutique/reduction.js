const {
  getServerDatas,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const { discordLink } = require("../../../utils/functions/linkedUser.js");
const { getPanierContainer } = require("../../../components/boutique.js");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);

  const code = interaction.fields.getTextInputValue("code");

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  const reduction = boutiqueDatas.reduction.find((r) => r.code === code);
  if (!reduction) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## ❌ Code Invalide`,
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: "Ce code de réduction n'est pas reconnu.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now < reduction.debut) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## ❌ Code non Disponible`,
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: `Ce code n'est pas encore disponible, il sera utilisable <t:${reduction.debut}:R>.`,
        },
      ],
    };

    return interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  if (now > reduction.fin) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## ❌ Code non Disponible`,
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: `Ce code est expiré, il n'est plus utilisable <t:${reduction.debut}:R>.`,
        },
      ],
    };

    return interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  let userPanier = boutiqueDatas.panier.find(
    (u) => u.memberId === interaction.user.id,
  );
  if (!userPanier) {
    userPanier = {
      pseudo: await discordLink(interaction.user.id),
      memberId: interaction.user.id,
      article: [],
      reduction: [],
    };

    boutiqueDatas.panier.push(userPanier);
  }

  userPanier.reduction.push(reduction.id);
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
};

exports.data = { name: "boutique_reduction" };
