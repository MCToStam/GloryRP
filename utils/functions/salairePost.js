const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const config = require("../../config.js");
const { getEmojiTete } = require("../../utils/functions/emojis.js");

function formatDateFr(date) {
  const [moisStr, annee] = date.split("_");
  const moisNum = parseInt(moisStr, 10);
  const moisFr =
    [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ][moisNum - 1] || moisStr;
  return `${moisFr} ${annee}`;
}

async function salairePost(client, serveur, serveurDatas, panelId, date) {
  const panel = serveurDatas.panels.find((p) => p.id === panelId);

  const salaireData = panel.salaire?.salaire || {};
  const dateExiste = Object.values(salaireData).some((staffSalaires) =>
    Object.keys(staffSalaires).includes(date)
  );

  let errorMsg;
  if (!dateExiste) {
    errorMsg = `Aucun salaire n'a été enregistré pour le mois "**${formatDateFr(
      date
    )}**" dans le panel **${panel.name}**.`;
  }

  let channel;
  if (panel.channels.salaire) {
    channel = client.channels.cache.get(panel.channels.salaire);
    if (!channel) {
      errorMsg = `Le salon du panel **${panel.name}** n'est pas valide.`;
    }
  } else {
    errorMsg = `Le panel **${panel.name}** n’a aucune salon défini.`;
  }

  if (errorMsg) {
    return (erreurContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Erreur",
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: errorMsg,
        },
      ],
    });
  }

  const moisData = await Promise.all(
    Object.entries(salaireData).map(async ([joueur, salaires]) => {
      const moisSalaires = salaires[date];
      if (!moisSalaires) return null;
      const total = moisSalaires.taches.reduce(
        (sum, t) => sum + (t.argent || 0),
        0
      );

      let emoji = "";
      try {
        const e = await getEmojiTete(client, joueur);
        emoji = e.toString();
      } catch (err) {
        console.warn(
          `Impossible de récupérer l'emoji pour ${joueur}:`,
          err.message
        );
      }

      return `${emoji} **${joueur}** : ${total}$`;
    })
  ).then((results) => results.filter(Boolean).join("\n"));

  const panelContainer = {
    type: 17,
    accent_color: config.couleur[serveur],
    components: [
      {
        type: 10,
        content: `## ${panel.emoji ? `${panel.emoji} ` : ""}Salaires ${
          panel.name
        } - ${formatDateFr(date)}`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content: moisData,
      },
    ],
  };

  const message = await channel.send({
    components: [panelContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });

  let responsableChannel;
  if (panel.channels.responsable) {
    responsableChannel = client.channels.cache.get(panel.channels.responsable);
    if (responsableChannel) {
      const commandes = Object.entries(salaireData)
        .map(([joueur, salaires]) => {
          const moisSalaires = salaires[date];
          if (!moisSalaires) return null;
          const total = moisSalaires.taches.reduce(
            (sum, t) => sum + (t.argent || 0),
            0
          );

          const cmdDon = panel.salaire.cmd_don
            .replace("[somme]", total)
            .replace("[joueur]", joueur);

          return cmdDon;
        })
        .filter(Boolean);

      const totalArgent = Object.values(salaireData).reduce((sum, salaires) => {
        const moisSalaires = salaires[date];
        if (!moisSalaires) return sum;
        return (
          sum + moisSalaires.taches.reduce((s, t) => s + (t.argent || 0), 0)
        );
      }, 0);

      const cmdRetrait = panel.salaire.cmd_retrait.replace(
        "[somme]",
        totalArgent
      );
      commandes.push(cmdRetrait);

      const responsableContainer = {
        type: 17,
        accent_color: config.couleur[serveur],
        components: [
          {
            type: 10,
            content: `## ${panel.emoji ? `${panel.emoji} ` : ""}Salaires ${
              panel.name
            } - ${formatDateFr(date)}`,
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: commandes.join("\n"),
          },
        ],
      };

      await responsableChannel.send({
        components: [responsableContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    }
  }

  return {
    type: 17,
    accent_color: config.colors.success,
    components: [
      {
        type: 10,
        content: "## :white_check_mark: Salaire Envoyé",
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content: `Le salaire du mois "**${formatDateFr(
          date
        )}**" sur le rôle-play **${
          panel.name
        }** a correctement été envoyé ici :${message.url}`,
      },
    ],
  };
}

module.exports = { salairePost, formatDateFr };
