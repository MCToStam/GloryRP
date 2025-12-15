const { getServerDatas } = require("../../../utils/functions/datas");

function formatTimestampToFR(timestamp) {
  if (!timestamp) return "";

  let ts = Number(timestamp);

  if (ts < 1e12) {
    ts *= 1000;
  }

  const date = new Date(ts);

  const pad = (n) => n.toString().padStart(2, "0");

  const jour = pad(date.getDate());
  const mois = pad(date.getMonth() + 1);
  const annee = date.getFullYear();
  const heures = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${jour}/${mois}/${annee} ${heures}h${minutes}`;
}

exports.run = async (client, interaction, config) => {
  const [_, boutiqueIdStr, reductionIdStr, type] =
    interaction.customId.split("-");
  const boutiqueId = Number(boutiqueIdStr);
  const reductionId = Number(reductionIdStr);

  const serverDatas = await getServerDatas(interaction);
  const boutiqueDatas = serverDatas.boutiques.find((b) => b.id === boutiqueId);
  const reduction = boutiqueDatas.reduction.find((a) => a.id === reductionId);

  let defaultValue = reduction[type];

  if ((type === "debut" || type === "fin") && reduction[type]) {
    defaultValue = formatTimestampToFR(reduction[type]);
  }

  const fields = {
    code: {
      title: "Modifie le code de la Réduction",
      label: "Nouveau code de la Réduction",
      placeholder: "Ex: NOEL2025",
    },
    valeur: {
      title: "Modifie la valeur de la Réduction",
      label: "Nouvelle valeur de la Réduction",
      placeholder: "Ex: 50% / 5000$",
    },
    debut: {
      title: "Modifie le début de la Réduction",
      label: "Nouvelle date de début de la Réduction",
      placeholder: "Ex: 14/12/2025 15h00",
    },
    fin: {
      title: "Modifie la fin de la Réduction",
      label: "Nouvelle date de fin de la Réduction",
      placeholder: "Ex: 14/12/2025 17h00",
    },
    usemax: {
      title: "Modifie le nombre d'utilisation maximale",
      label: "Nouveau nombre d'utilisation maximale",
      placeholder: 'Entrez "-1" pour ne pas mettre de limite',
    },
  };

  const modal = {
    custom_id: `reduction_edit-${boutiqueId}-${reductionId}-${type}`,
    title: fields[type].title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: type,
            label: fields[type].label,
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: fields[type].placeholder,
            ...(defaultValue ? { value: defaultValue } : {}),
            required: true,
          },
        ],
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = {
  name: "reduction_edit",
};
