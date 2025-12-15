const { getServerDatas } = require("../../../../utils/functions/datas.js");
const { getHexEmoji } = require("../../../../utils/functions/emojis.js");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const serverDatas = await getServerDatas(interaction);
  const boutique = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const categorieOptions = await Promise.all(
    boutique.categorie.map(async (categorie) => {
      const e = categorie.couleur
        ? await getHexEmoji(client, categorie.couleur)
        : undefined;

      let emoji;
      if (e) {
        if (e.id && /^\d+$/.test(e.id)) {
          emoji = { id: e.id, name: e.name, animated: e.animated || false };
        } else {
          emoji = { name: e.name || e };
        }
      }

      return {
        label: categorie.nom,
        value: String(categorie.id),
        description: `Categorie : ${categorie.nom} | Couleur : ${categorie.couleur}`,
        emoji,
      };
    }),
  );

  const gradesMap = new Map();

  for (const panel of serverDatas.panels || []) {
    for (const grade of panel.grade || []) {
      if (!gradesMap.has(grade.gradeId)) {
        gradesMap.set(grade.gradeId, grade);
      }
    }
  }

  const grades = [...gradesMap.values()];

  const gradeOptions = await Promise.all(
    grades.map(async (grade) => {
      const e = grade.couleur
        ? await getHexEmoji(client, grade.couleur)
        : undefined;

      let emoji;
      if (e) {
        if (e.id && /^\d+$/.test(e.id)) {
          emoji = { id: e.id, name: e.name, animated: e.animated || false };
        } else {
          emoji = { name: e.name || e };
        }
      }

      return {
        label: grade.nom,
        value: `${String(grade.gradeId)}_${String(grade.gradeId)}`,
        description: `Grade ${grade.nom} | Couleur : ${grade.couleur}`,
        ...(emoji ? { emoji } : {}),
      };
    }),
  );

  const modal = {
    custom_id: `article_create-${boutiqueId}`,
    title: "Créer un nouvel article",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "nom",
            label: "Nom de l'article",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: Munition de M249",
            required: true,
          },
        ],
      },
      {
        type: 18,
        label: "Catégorie associée",
        component: {
          type: 3,
          custom_id: "categorie",
          placeholder: "Sélectionne la catégorie",
          options: categorieOptions,
        },
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "prix",
            label: "Prix de l'article à l'unité",
            style: 1,
            min_length: 1,
            max_length: 100,
            placeholder: "Ex: 2000$",
            required: true,
          },
        ],
      },
      {
        type: 18,
        label: "Grade(s) vendeur(s)",
        component: {
          type: 3,
          custom_id: "grade",
          placeholder: "Sélectionne un ou plusieurs grades",
          options: gradeOptions,
          max_values: gradeOptions.length,
        },
      },
    ],
  };

  await interaction.showModal(modal);
};

exports.data = { name: "article_create" };
