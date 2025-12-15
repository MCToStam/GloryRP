const {
  getBoutiqueArticleContainer,
  getBoutiqueReductionContainer,
} = require("../../components/containers");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");

exports.run = async (client, interaction) => {
  await interaction.deferUpdate();
  const [, type, page, boutiqueId] = interaction.customId.split("-");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find(
    (x) => x.id === Number(boutiqueId),
  );

  let container;
  if (type === "article") {
    container = await getBoutiqueArticleContainer(
      boutiqueId,
      guildColor,
      boutiqueDatas,
      page,
    );
  } else if (type === "reduction") {
    container = await getBoutiqueReductionContainer(
      boutiqueId,
      guildColor,
      boutiqueDatas,
      page,
    );
  }

  return interaction.editReply({
    components: [container],
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "page",
};
