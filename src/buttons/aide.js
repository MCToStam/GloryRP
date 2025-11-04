const { MessageFlags, SeparatorSpacingSize } = require("discord.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const module = interaction.customId.split("-")[1];

  let descriptionMap = {
    salaire:
      'Cette configuration vous permet de gérer l\'envoie de vos salaires. Il est possible de les envoyer automatiquement à 10h00 le 1er jour de chaque mois. Vous pouvez aussi choisir e l\'envoyer manuellement mais il sera obligatoirement mensuel.\n\nVous avez aussi la possibilité de modifier les commandes permettant de données l\'argent aux joueurs. Par exemple si vous rentrez ``/econ bank take ONU [argent]``, il vous sera affiché par la suite la même commande mais avec "[argent]" remplacé par le total à retirer. Et pour donner l\'argent, vous pouvez par exemple utiliser ``/eco give [joueur] [argent]`` avec "[joueur]" qui sera remplacé par le pseudonyme du joueur et "[argent]" par l\'argent à lui donner.\n\nLe message comprennant les commandes sera lui envoyé dans le salon de responsable.',
    grade:
      "Les grades d'un rôle-play ont différentes configurations :\n\n- **Nom :**\nCorrespond au nom exact du grade\n- **Couleur ( optionnel ) :**\nCouleur hexadecimal correspondant au grade\n- **Tier :**\nTier du grade, le tier 5 étant le plus élevé, cela correspond à l'ordre des grades dans l'effectif\n- **Rôle(s) attribué(s) lors d'un rank :**\nLors de la commande ``/rank`` ou ``/derank``, ce sont le(s) rôle(s) qui sera ou seront ajouté(s) ou enlevé(s) automatiquement",
    depotdeplainte:
      "Cette configuration est utile pour le rôle-play postant les plaintes, elle permet d'envoyer une alerte lorsqu'un nouveau message est envoyé dans une discussion du forum",
    candidature:
      "Avec ceci, il vous est possible de recevoir un message dès lors qu'un nouveau post est envoyé dans une catégorie du forum. La couleur du message correspond au premier tag de la discussion, de plus les posts épinglés ne créés pas d'alertes",
    tâche:
      "Configurer des tâches est primordiale, c'est ce qui permet de générer de l'argent pour vos membres du rôle-play. Voici quelques aides sur les différentes configurations :\n\n- **Nom :**\nNom de la tâche\n- **Description de la tâche :**\nDescription qui sera affiché dans le menu déroulant des tâches\n- **Emoji :**\nEmoji qui sera affiché dans le menu déroulant des tâches ainsi que dans les messages d'acceptation...\n- **Lien Forum :**\nObligatoire uniquement si le niveau de vérification est 2, 3 ou 4\n- **Salaire :**\nArgent donné lorsque la tâche est exécuté, vous pouvons configurer une somme différente en fonction du jour où la tâche est postée\n- **Niveau de vérification :**\n> __100% Manuel :__ Les joueurs devront sélectionner la tâche, écrire ce qu'ils veulent puis vous recevrez leur demande avec la possibilité d'accepter ou refuser la tâche\n> __Vérification :__ Grâce à la catégorie forum, le joueur devra entrer une partie du titre ou le lien de la discussion, le bot vérifiera que la discussion est bien créé et que c'est bien lui l'auteur\n> __Acceptation Automatique :__ Dès lors que la plainte est vérifiée, comme dit précédement, alors l'argent est automatiquement attribué au salaire du mois en cours\n> __Totalement Automatique :__ Cette fois ci, c'est le robot lui même qui regarde lui même sur les catégories forums si un membre du rôle-play a effectué une tâche et valide automatiquement si tout est vérifié\n- **Grade Autorisé :**\nListe des grades autorisés à effectuer la tâche",
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
  type: "User",
};
