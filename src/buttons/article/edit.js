const { getServerDatas } = require("../../../utils/functions/datas");

exports.run = async (client, interaction, config) => {
  try {
    const [_, boutiqueIdStr, articleIdStr, type] =
      interaction.customId.split("-");
    const boutiqueId = Number(boutiqueIdStr);
    const articleId = Number(articleIdStr);

    const serverDatas = await getServerDatas(interaction);
    const boutiqueDatas = serverDatas.boutiques.find(
      (b) => b.id === boutiqueId,
    );
    const article = boutiqueDatas.article.find((a) => a.id === articleId);

    const fields = {
      nom: {
        title: "Modifie le nom de l'Article",
        label: "Nouveau nom de l'Article",
        placeholder: "Ex: Munition de M249",
      },
      emoji: {
        title: "Modifie l'émoji de l'Article",
        label: "Nouvel émoji de l'article",
        placeholder: "Ex: ⚔️",
      },
      prix: {
        title: "Modifie le prix unitaire de l'Article",
        label: "Nouveau prix unitaire de l'article",
        placeholder: "Ex: 2000$",
      },
      image: {
        title: "Modifie l'image de l'Article",
        label: "Nouvelle image de l'article",
        placeholder: "",
      },
    };

    let components;

    const field = fields[type];
    if (type === "image") {
      components = [
        {
          type: 18,
          label: field.label,
          component: {
            type: 19,
            custom_id: type,
            max_values: 1,
            required: true,
          },
        },
      ];
    } else {
      components = [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: type,
              label: field.label,
              style: 1,
              min_length: 1,
              max_length: 100,
              placeholder: field.placeholder,
              ...(article[type] ? { value: article[type] } : {}),
              required: true,
            },
          ],
        },
      ];
    }

    const modal = {
      custom_id: `article_edit-${boutiqueId}-${articleId}-${type}`,
      title: fields[type].title,
      components,
    };

    await interaction.showModal(modal);
  } catch (e) {
    console.log(e);
  }
};

exports.data = {
  name: "article_edit",
};
