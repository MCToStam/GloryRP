const { MessageFlags, SeparatorSpacingSize } = require("discord.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const module = interaction.customId.split("-")[1];

  let descriptionMap = {
    salaire:
      'Cette configuration vous permet de gérer l\'envoie de vos salaires. Il est possible de les envoyer automatiquement à 10h00 le 1er jour de chaque mois. Vous pouvez aussi choisir e l\'envoyer manuellement mais il sera obligatoirement mensuel.\n\nVous avez aussi la possibilité de modifier les commandes permettant de données l\'argent aux joueurs. Par exemple si vous rentrez ``/econ bank take ONU [argent]``, il vous sera affiché par la suite la même commande mais avec "[argent]" remplacé par le total à retirer. Et pour donner l\'argent, vous pouvez par exemple utiliser ``/eco give [joueur] [argent]`` avec "[joueur]" qui sera remplacé par le pseudonyme du joueur et "[argent]" par l\'argent à lui donner.\n\nLe message comprennant les commandes sera lui envoyé dans le salon de responsable.',
  };

  const aideContainer = {
    type: 17,
    accent_color: config.colors.success,
    components: [
      {
        type: 10,
        content: `## :question: Aide ${
          module.charAt(0).toUpperCase() + module.slice(1)
        }`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content: descriptionMap[module],
      },
    ],
  };

  await interaction.editReply({
    components: [aideContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "aide",
};

exports.conf = {
  type: "Button",
};
