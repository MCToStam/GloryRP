const {
  getGuildColor,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const { getPaiementDonneeContainer } = require("../../../components/boutique");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const action = interaction.customId.split("-")[2];
  const pseudo = interaction.customId.split("-")[3];
  const first = interaction.customId.split("-")[4];

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((b) => b.id === boutiqueId);

  let modal;
  if (action === "donnee") {
    if (first === "first") {
      await interaction.deferReply();
    } else {
      await interaction.deferUpdate();
    }
    const container = await getPaiementDonneeContainer(
      guildColor,
      boutiqueId,
      boutiqueDatas,
      client,
      Number(pseudo),
    );

    return interaction.editReply({
      components: [container],
      flags: 32768,
    });
  } else if (action === "commande") {
    modal = {
      custom_id: `boutique_paiement-${boutiqueId}-${action}`,
      title: "Modifier la commande",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "commande",
              label: "Commande à exécuter pour payer",
              style: 1,
              min_length: 1,
              max_length: 20,
              placeholder: "Ex: payrp",
              ...(boutiqueDatas.paiement.commande
                ? { value: boutiqueDatas.paiement.commande }
                : {}),
              required: true,
            },
          ],
        },
      ],
    };
  } else if (action === "edit") {
    modal = {
      custom_id: `boutique_paiement-${boutiqueId}-${action}`,
      title: "Modifier l'argent d'un joueur",
      components: [
        {
          type: 18,
          label: "Type d'action à effectuer",
          component: {
            type: 3,
            custom_id: "type",
            placeholder: "Choisit l'action à effectuer",
            options: [
              {
                label: "Ajouter de l'argent",
                value: "add",
                description: "Permet d'ajouter de l'argent au joueur",
              },
              {
                label: "Retirer de l'argent",
                value: "remove",
                description: "Permet de retirer de l'argent au joueur",
              },
              {
                label: "Définir l'argent",
                value: "set",
                description: "Permet de définir l'argent du joueur",
              },
            ],
          },
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "pseudo",
              label: "Pseudonyme du joueur",
              style: 1,
              min_length: 3,
              max_length: 32,
              placeholder: "Ex: ToStam",
              ...(pseudo ? { value: pseudo } : {}),
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "argent",
              label: "Somme à ajouter/retirer/définir",
              style: 1,
              min_length: 1,
              max_length: 20,
              placeholder: "Ex: 10000",
              required: true,
            },
          ],
        },
      ],
    };
  }

  await interaction.showModal(modal);
};

exports.data = { name: "boutique_paiement" };
