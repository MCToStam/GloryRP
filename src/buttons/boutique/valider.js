const {
  getServerDatas,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const { discordLink } = require("../../../utils/functions/linkedUser");
const { getPanierContainer } = require("../../../components/boutique");

exports.run = async (client, interaction, config) => {
  const guildColor = interaction.customId.split("-")[1];
  const boutiqueId = Number(interaction.customId.split("-")[2]);

  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((b) => b.id === boutiqueId);

  const panier = boutiqueDatas.panier.find(
    (p) => p.memberId === interaction.user.id,
  );

  const articlesPanier = panier.article ?? [];

  let totalBrut = 0;
  const detailsArticles = [];

  for (const article of articlesPanier) {
    const articleVrai = boutiqueDatas.article.find((a) => a.id === article.id);
    if (!articleVrai) continue;

    const prixUnitaire = Number(articleVrai.prix);
    const totalArticle = prixUnitaire * article.quantite;

    totalBrut += totalArticle;

    detailsArticles.push({
      id: articleVrai.id,
      categorie: articleVrai.categorie,
      total: totalArticle,
    });
  }

  const now = Math.floor(Date.now() / 1000);

  const reductionsValides = (panier.reduction ?? [])
    .map((id) => boutiqueDatas.reduction.find((r) => r.id === id))
    .filter((r) => r && r.debut <= now && now <= r.fin);

  let totalFinal = totalBrut;

  for (const reduction of reductionsValides) {
    const articlesEligibles = detailsArticles.filter((a) => {
      if (reduction.article?.length && reduction.categorie?.length) {
        return (
          reduction.article.includes(a.id) &&
          reduction.categorie.includes(a.categorie)
        );
      }
      if (reduction.article?.length) {
        return reduction.article.includes(a.id);
      }
      if (reduction.categorie?.length) {
        return reduction.categorie.includes(a.categorie);
      }
      return true;
    });

    const totalEligibles = articlesEligibles.reduce(
      (sum, a) => sum + a.total,
      0,
    );

    if (totalEligibles <= 0) continue;

    if (
      typeof reduction.valeur === "string" &&
      reduction.valeur.endsWith("%")
    ) {
      const pourcentage = parseFloat(reduction.valeur.replace("%", ""));
      const remise = totalEligibles * (pourcentage / 100);
      totalFinal -= remise;
    } else if (
      typeof reduction.valeur === "string" &&
      reduction.valeur.endsWith("$")
    ) {
      const remise = parseFloat(reduction.valeur.replace("$", ""));
      totalFinal -= remise;
    }
  }
  totalFinal = Math.max(0, Math.round(totalFinal));

  if (boutiqueDatas.paiement.mode === "manuelle") {
    const modal = {
      custom_id: `boutique_valider-${guildColor}-${boutiqueId}`,
      title: "Valider la commande",
      components: [
        {
          type: 18,
          label: `Capture d'Écran du Paiement de ${totalFinal.toLocaleString()}$`,
          component: {
            type: 19,
            custom_id: "screen",
            max_values: 1,
            required: true,
          },
        },
      ],
    };

    await interaction.showModal(modal);
  } else if (boutiqueDatas.paiement.mode === "automatique") {
    const pseudo = await discordLink(interaction.user.id);
    const argentUser = boutiqueDatas.paiement.donnee[pseudo] || 0;
    if (argentUser < totalFinal) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## 💳 Pas assez d'Argent",
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content: `Il te manque ${(
              totalFinal - argentUser
            ).toLocaleString()}$ pour honorer cette commande. Il te faut faire cette commande : \`\`\`/${
              boutiqueDatas.paiement.commande
            } ${totalFinal - argentUser}\`\`\``,
          },
        ],
      };

      return await interaction.reply({
        components: [errorContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
    } else {
      const goodContainer = {
        type: 17,
        accent_color: config.colors.success,
        components: [
          {
            type: 10,
            content: "## 💳 Pas assez d'Argent",
          },
          {
            type: 14,
            spacing: 2,
          },
          {
            type: 10,
            content: `Ta commande a correctement été envoyée pour la somme de **${totalFinal.toLocaleString()}$** et ton panier a été vidé. Il te reste désormais **${(
              argentUser - totalFinal
            ).toLocaleString()}$** sur ton compte GloryRP **${
              guildColor.charAt(0).toUpperCase() + guildColor.slice(1)
            }**.`,
          },
        ],
      };

      boutiqueDatas.paiement.donnee[pseudo] = argentUser - totalFinal;
      const panierIndex = boutiqueDatas.panier.findIndex(
        (c) => c.pseudo === pseudo,
      );
      boutiqueDatas.panier.splice(panierIndex, 1);
      saveServerDatas(interaction, serverDatas, guildColor);

      const panierContainer = await getPanierContainer(
        guildColor,
        boutiqueId,
        interaction.user.id,
        boutiqueDatas,
        client,
      );

      await interaction.message.edit({
        components: [panierContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });

      return await interaction.reply({
        components: [goodContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
    }
  }
};

exports.data = { name: "boutique_valider" };
