const { getServerDatas } = require("../../utils/functions/datas.js");
const { formatDateFr } = require("../../utils/functions/salairePost.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  const salaireData = panelDatas.salaire?.salaire || {};
  const moisDisponiblesSet = new Set();

  Object.values(salaireData).forEach((joueurSalaires) => {
    Object.entries(joueurSalaires).forEach(([mois, dataMois]) => {
      if (!dataMois || !Array.isArray(dataMois.taches)) return;

      const aTacheValide = dataMois.taches.some(
        (t) => t.status !== "waiting" && t.status !== "refused",
      );

      if (aTacheValide) {
        moisDisponiblesSet.add(mois);
      }
    });
  });

  const moisDisponibles = Array.from(moisDisponiblesSet).sort();

  if (moisDisponibles.length === 0) {
    const erreurContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :x: Aucun Salaire`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Aucun salaire ne peut être donné.",
        },
      ],
    };

    return await interaction.reply({
      components: [erreurContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const modal = {
    custom_id: `salaire_post-${panelId}`,
    title: "Envoyer le salaire",
    components: [
      {
        type: 18,
        label: "Pour quel date envoyer le salaire ?",
        component: {
          type: 3,
          custom_id: "date",
          placeholder: "Sélectionne un mois",
          options: moisDisponibles.map((mois) => ({
            label: formatDateFr(mois),
            value: mois,
            description: "Envoyer le salaire pour ce mois",
          })),
        },
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "salairePost",
};

exports.conf = {
  type: "User",
};
