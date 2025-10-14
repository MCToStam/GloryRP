const config = require("../config.js");
const { SeparatorSpacingSize, ButtonStyle } = require("discord.js");
const { getEmojiTete } = require("../utils/functions/emojis.js");
const { createCanvas } = require("canvas");
const Chart = require("chart.js/auto");

const nom_mois = [
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
];

function getMonthNavigation(currentMonth, currentYear) {
  const prevDate = new Date(currentYear, currentMonth - 2, 1);
  const nextDate = new Date(currentYear, currentMonth, 1);

  return {
    mois_precedent: String(prevDate.getMonth() + 1).padStart(2, "0"),
    annee_precedent: prevDate.getFullYear(),
    mois_suivant: String(nextDate.getMonth() + 1).padStart(2, "0"),
    annee_suivant: nextDate.getFullYear(),
  };
}

async function getSalaireContainer(
  client,
  serverDatas,
  panel,
  serv,
  mois = "current"
) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelId = Number(panel);

  const panelInfo = serverDatas.panels.find((p) => p.id === panelId);
  if (!panelInfo) {
    return {
      error: true,
      component: {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry: Panel Introuvable",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Le panel **${panel}** n'existe pas.`,
          },
        ],
      },
    };
  }

  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const salaire = panelDatas.salaire.salaire;
  const panelLabel = panelInfo.name;

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  let targetMonth, targetYear;
  if (mois === "current") {
    targetMonth = currentMonth;
    targetYear = currentYear;
  } else {
    const [m, y] = mois.split("_");
    targetMonth = parseInt(m);
    targetYear = parseInt(y);
  }

  const moisKey = String(targetMonth).padStart(2, "0") + "_" + targetYear;

  const salaireLines = [];
  const selectOptions = [];

  for (const [roleplayName, roleplayData] of Object.entries(salaire)) {
    if (roleplayData[moisKey]) {
      const taches = roleplayData[moisKey].taches || [];
      const total = taches.reduce((sum, t) => sum + (t.argent || 0), 0);

      let emojiObj = null;
      let emojiString = "";
      try {
        const emojiGuildObj = await getEmojiTete(client, roleplayName);

        if (emojiGuildObj && typeof emojiGuildObj === "object") {
          emojiObj = {
            id: emojiGuildObj.id,
            name: emojiGuildObj.name,
            animated: !!emojiGuildObj.animated,
          };

          emojiString = emojiGuildObj.toString();
        } else if (typeof emojiGuildObj === "string") {
          emojiObj = { name: emojiGuildObj };
          emojiString = emojiGuildObj;
        }
      } catch (err) {
        console.warn(
          "Impossible de récupérer l'emoji tête pour",
          roleplayName,
          err
        );
      }

      salaireLines.push(
        `${emojiString}**${roleplayName}** : ${
          total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "$"
        } ( ${taches.length} tâche${taches.length > 1 ? "s" : ""} )`
      );

      const option = {
        label: roleplayName,
        value: `salaire_joueur-${roleplayName}`,
        description: `Voir le salaire de ${roleplayName}`,
      };
      if (emojiObj) {
        if (emojiObj.id)
          option.emoji = {
            id: emojiObj.id,
            name: emojiObj.name,
            animated: !!emojiObj.animated,
          };
        else option.emoji = { name: emojiObj.name };
      }

      selectOptions.push(option);
    }
  }

  if (salaireLines.length === 0) {
    salaireLines.push("*Aucune tâche enregistrée pour ce mois.*");
  }

  const { mois_precedent, annee_precedent, mois_suivant, annee_suivant } =
    getMonthNavigation(targetMonth, targetYear);

  const moisActuel = targetMonth === currentMonth && targetYear === currentYear;
  const moisLabel = `${nom_mois[targetMonth - 1]} ${targetYear}`;

  const components = [
    {
      type: 10,
      content: `## 💰 Salaire du Role-Play ${servName} - ${panelLabel}`,
    },
    {
      type: 14,
      spacing: SeparatorSpacingSize.Large,
    },
    {
      type: 10,
      content: salaireLines.join("\n"),
    },
    {
      type: 14,
      spacing: SeparatorSpacingSize.Small,
    },
    {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: `salaire-${mois_precedent}_${annee_precedent}-${panelId}-${serv}`,
          label: "⬅️",
          style: ButtonStyle.Primary,
        },
        {
          type: 2,
          custom_id: "salaire-status",
          label: moisLabel,
          style: ButtonStyle.Secondary,
          disabled: true,
        },
        {
          type: 2,
          custom_id: `salaire-${mois_suivant}_${annee_suivant}-${panelId}-${serv}`,
          label: "➡️",
          style: ButtonStyle.Primary,
          disabled: moisActuel,
        },
      ],
    },
  ];

  if (selectOptions.length > 0) {
    components.push(
      {
        type: 14,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `salaire-select-${panelId}-${serv}`,
            placeholder: "Choisis un joueur",
            min_values: 1,
            max_values: 1,
            options: selectOptions,
          },
        ],
      }
    );
  }

  return {
    error: false,
    component: {
      type: 17,
      accent_color: config.couleur[serv],
      components,
    },
  };
}

async function getJoueurSalaireContainer(serverDatas, panel, serv, joueur) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelId = Number(panel);

  const panelDatas = serverDatas.panels.find((p) => p.id === panelId);
  if (!panelDatas) {
    return {
      error: true,
      component: {
        type: 17,
        accent_color: config.colors.error,
        components: [
          { type: 10, content: "## :no_entry: Panel Introuvable" },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          { type: 10, content: `Le panel **${panel}** n'existe pas.` },
        ],
      },
    };
  }

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const salaire = panelDatas.salaire.salaire;
  const joueurSalaire = salaire[joueur] || {};

  const sortedSalaire = Object.entries(joueurSalaire).sort(([a], [b]) => {
    const [ma, ya] = a.split("_").map(Number);
    const [mb, yb] = b.split("_").map(Number);
    if (ya !== yb) return ya - yb;
    return ma - mb;
  });

  let previousTotal = null;
  const labels = [];
  const valeurs = [];

  const salaireLines = sortedSalaire.map(([key, data]) => {
    const [mois, annee] = key.split("_");
    const moisIndex = Number(mois) - 1;
    const moisNom = nom_mois[moisIndex] || mois;

    const total = (data.taches || [])
      .filter((t) => t.status === "accepted")
      .reduce((acc, t) => acc + (t.argent || 0), 0);

    labels.push(`${moisNom} ${annee}`);
    valeurs.push(total);

    let variation = "";
    if (previousTotal !== null) {
      if (previousTotal === 0 && total === 0) variation = "( 0% )";
      else if (previousTotal === 0 && total > 0) variation = "( +∞% )";
      else {
        const diff = ((total - previousTotal) / previousTotal) * 100;
        const signe = diff >= 0 ? "+" : "";
        const couleur =
          diff >= 0
            ? "<:up:1421602529720008824>"
            : "<:down:1421602527295832290>";
        variation = `(${couleur} ${signe}${diff.toFixed(0)}%)`;
      }
    }

    previousTotal = total;

    return `- **${moisNom} ${annee}** : ${
      total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "$"
    } ${variation}`;
  });

  let attachments = [];
  if (valeurs.length >= 2) {
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: valeurs,
            borderColor: "#4caf50",
            backgroundColor: "#4caf50",
            tension: 0.2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    attachments.push({
      attachment: canvas.toBuffer("image/png"),
      name: "salaire.png",
    });
  }

  const components = [
    {
      type: 10,
      content: `## 💰 Salaire du Role-Play ${servName} - ${panelDatas.name}`,
    },
    { type: 14, spacing: SeparatorSpacingSize.Large },
  ];

  components.push({
    type: 10,
    content:
      salaireLines.length > 0
        ? salaireLines.join("\n")
        : "Aucun salaire enregistré pour ce joueur.",
  });

  if (attachments.length) {
    components.push(
      { type: 14, spacing: SeparatorSpacingSize.Small },
      { type: 12, items: [{ media: { url: "attachment://salaire.png" } }] }
    );
  }

  components.push(
    { type: 14, spacing: SeparatorSpacingSize.Small },
    {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: `salaire-${currentMonth}_${currentYear}-${panelId}-${serv}`,
          label: "⬅️ Retour",
          style: ButtonStyle.Primary,
        },
        {
          type: 2,
          custom_id: `salaire_tache-${joueur}-${panelId}-${serv}-${currentMonth}_${currentYear}`,
          label: "📜 Afficher les Tâches",
          style: ButtonStyle.Primary,
        },
      ],
    }
  );

  return {
    attachments,
    component: {
      type: 17,
      accent_color: config.couleur[serv],
      components,
    },
  };
}

async function getJoueurTacheContainer(
  client,
  joueur,
  serverDatas,
  panel,
  serv,
  mois = "current"
) {
  const servName = serv.charAt(0).toUpperCase() + serv.slice(1);
  const panelId = Number(panel);

  const panelDatas = serverDatas.panels.find((p) => p.id === panelId);
  if (!panelDatas) {
    return {
      error: true,
      component: {
        type: 17,
        accent_color: config.colors.error,
        components: [
          { type: 10, content: "## :no_entry: Panel Introuvable" },
          { type: 14, spacing: SeparatorSpacingSize.Large },
          { type: 10, content: `Le panel **${panel}** n'existe pas.` },
        ],
      },
    };
  }

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  let targetMonth, targetYear;
  if (mois === "current") {
    targetMonth = currentMonth;
    targetYear = currentYear;
  } else {
    const [m, y] = mois.split("_");
    targetMonth = parseInt(m);
    targetYear = parseInt(y);
  }

  const key = `${String(targetMonth).padStart(2, "0")}_${targetYear}`;
  const joueurSalaire = panelDatas.salaire.salaire[joueur] || {};
  const tachesData = joueurSalaire[key]?.taches || [];

  const moisNom = nom_mois[targetMonth - 1] || targetMonth;

  const acceptedTasks = tachesData.filter((t) => t.status === "accepted");
  const waitingTasks = tachesData.filter((t) => t.status === "waiting");
  const refusedTasks = tachesData.filter((t) => t.status === "refused");

  const formatTache = async (t) => {
    const argent =
      t.argent !== null && t.argent !== undefined
        ? `${t.argent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}$`
        : "-";
    const lien = t.lien ? `[${t.nom}](${t.lien})` : t.nom;

    let staffTexte = "";
    if (t.staff === "automatique") {
      staffTexte = "automatiquement";
    } else if (t.staff) {
      const emoji = await getEmojiTete(client, t.staff);
      staffTexte = `par ${emoji} **${t.staff || "inconnu"}**`;
    }

    if (t.status === "accepted") {
      return `- **${lien}** : ${argent}, acceptée ${staffTexte}`;
    } else if (t.status === "waiting") {
      return `- **${lien}** : ${argent}`;
    } else {
      return `- **${lien}** : ${argent}, refusée ${staffTexte}`;
    }
  };

  const acceptedLines =
    acceptedTasks.length > 0
      ? (await Promise.all(acceptedTasks.map(formatTache))).join("\n")
      : "_Aucune tâche acceptée ce mois-ci._";

  const waitingLines =
    waitingTasks.length > 0
      ? (await Promise.all(waitingTasks.map(formatTache))).join("\n")
      : "_Aucune tâche en attente ce mois-ci._";

  const refusedLines =
    refusedTasks.length > 0
      ? (await Promise.all(refusedTasks.map(formatTache))).join("\n")
      : "_Aucune tâche refusée ce mois-ci._";

  const { mois_precedent, annee_precedent, mois_suivant, annee_suivant } =
    getMonthNavigation(targetMonth, targetYear);

  const isCurrentMonth =
    mois_suivant > currentMonth && annee_suivant === currentYear
      ? true
      : annee_suivant > currentYear;

  const components = [
    {
      type: 10,
      content: `## 📝 Tâches du Role-Play ${servName} - ${panelDatas.name} (${moisNom} ${targetYear})`,
    },
    { type: 14, spacing: SeparatorSpacingSize.Large },
    { type: 10, content: `### <:accepted:1427727438263222424> Tâches Acceptées\n${acceptedLines}` },
    { type: 14, spacing: SeparatorSpacingSize.Small },
    { type: 10, content: `### <:waiting:1427727440847044663> Tâches en Attente\n${waitingLines}` },
    { type: 14, spacing: SeparatorSpacingSize.Small },
    { type: 10, content: `### <:refused:1427727444391104704> Tâches Refusées\n${refusedLines}` },
    { type: 14, spacing: SeparatorSpacingSize.Small },
    {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: `salaire_tache-${joueur}-${panelId}-${serv}-${mois_precedent}_${annee_precedent}`,
          label: "⬅️ Mois précédent",
          style: ButtonStyle.Primary,
        },
        {
          type: 2,
          custom_id: `salaire_tache-${joueur}-${panelId}-${serv}-${mois_suivant}_${annee_suivant}`,
          label: "➡️ Mois suivant",
          style: ButtonStyle.Primary,
          disabled: isCurrentMonth,
        },
      ],
    },
  ];

  return {
    component: {
      type: 17,
      accent_color: config.couleur[serv],
      components,
    },
  };
}

module.exports = {
  getSalaireContainer,
  getJoueurSalaireContainer,
  getJoueurTacheContainer,
};
