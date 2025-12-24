const { getServerDatas } = require("../../../utils/functions/datas.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const action = interaction.customId.split("-")[2];

  const serverDatas = await getServerDatas(interaction);
  const boutiqueDatas = serverDatas.boutiques.find((b) => b.id === boutiqueId);

  let modal;
  if (action === "commande") {
    modal = {
      custom_id: `boutique_payement-${boutiqueId}-${action}`,
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
              ...(boutiqueDatas.payement.commande
                ? { value: boutiqueDatas.payement.commande }
                : {}),
              required: true,
            },
          ],
        },
      ],
    };
  } else if (action === "donnee") {
    modal = {
      custom_id: `boutique_payement-${boutiqueId}-${action}`,
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
              max_length: 5,
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

exports.data = { name: "boutique_payement" };
