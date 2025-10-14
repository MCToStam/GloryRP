const {
  MessageFlags,
  SeparatorSpacingSize,
  ChannelType,
} = require("discord.js");
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
    return ({
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
      const tachesValides = moisSalaires.taches.filter(
        (t) => t.status !== "waiting" && t.status !== "refused"
      );

      const total = tachesValides.taches.reduce(
        (sum, t) => sum + (t.argent || 0),
        0
      );

      if (total === 0) return null;

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

  let components = [panelContainer];

  if (panel.roles.salaire && panel.roles.salaire.length > 0) {
    const roleText = {
      type: 10,
      content: panel.roles.salaire.map((val) => `<@&${val}>`).join(" "),
    };
    components = [roleText, panelContainer];
  }

  const message = await channel.send({
    components,
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });

  if (channel.type === ChannelType.GuildAnnouncement) {
    await message.crosspost();
  }

  let responsableChannel;
  if (panel.channels.responsable) {
    responsableChannel = client.channels.cache.get(panel.channels.responsable);
    if (responsableChannel) {
      const totalArgent = Object.values(salaireData).reduce((sum, salaires) => {
        const moisSalaires = salaires[date];
        if (!moisSalaires) return sum;

        const tachesValides = moisSalaires.taches.filter(
          (t) => t.status !== "waiting" && t.status !== "refused"
        );

        return sum + tachesValides.reduce((s, t) => s + (t.argent || 0), 0);
      }, 0);

      const cmdRetrait = `> 🌐 \`\`${panel.salaire.cmd_retrait.replace(
        "[argent]",
        totalArgent
      )}\`\``;

      const commandesJoueurs = await Promise.all(
        Object.entries(salaireData).map(async ([joueur, salaires]) => {
          const moisSalaires = salaires[date];
          if (!moisSalaires) return null;

          const tachesValides = moisSalaires.taches.filter(
            (t) => t.status !== "waiting" && t.status !== "refused"
          );

          const total = tachesValides.reduce(
            (sum, t) => sum + (t.argent || 0),
            0
          );

          if (total === 0) return null;

          const cmdDon = panel.salaire.cmd_don
            .replace("[argent]", total)
            .replace("[joueur]", joueur);

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

          return `> ${emoji} \`\`${cmdDon}\`\``;
        })
      );

      const commandesJoueursFiltrees = commandesJoueurs.filter(Boolean);

      const commandesFinales = [
        cmdRetrait,
        ...commandesJoueursFiltrees.map((c) => `\n${c}`),
      ];

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
            content: commandesFinales.join("\n"),
          },
        ],
      };

      const responsableMessage = await responsableChannel.send({
        components: [responsableContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });

      if (responsableChannel.type === ChannelType.GuildAnnouncement) {
        await responsableMessage.crosspost();
      }
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
