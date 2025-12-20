const {
  getBoutiqueEditReductionContainer,
} = require("../../../../components/containers");
const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../../utils/functions/datas.js");
const {
  toTimeStamp,
} = require("../../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  await interaction.deferUpdate();

  const reductionId1 = Number(interaction.values[0].split("-")[2]);
  const [_, boutiqueIdStr, reductionId2, type] =
    interaction.customId.split("-");
  const reductionId = Number(reductionId1) || Number(reductionId2);
  const boutiqueId = Number(boutiqueIdStr);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutique = serverDatas.boutiques.find((x) => x.id === boutiqueId);
  const reductionData = boutique.reduction.find((x) => x.id === reductionId);

  if (type) {
    let newValue = interaction.values;
    const modifDate = await toTimeStamp(new Date());

    newValue = newValue.map((v) =>
      v.startsWith("reduction_edit-") ? Number(v.slice(15)) : Number(v),
    );

    const actionLabel =
      type === "categorie"
        ? "de la/les catégorie(s) associée(s)"
        : "du/des article(s) associé(s)";

    serverDatas.logs ??= [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      boutique: boutiqueId,
      action: `Modification ${actionLabel} de la réduction ${reductionData.code} de ${reductionData[type]} en ${newValue}`,
    });

    reductionData[type] = newValue;

    await saveServerDatas(interaction, serverDatas, guildColor);
  }

  const reductionContainer = await getBoutiqueEditReductionContainer(
    client,
    guildColor,
    reductionData,
    boutique,
  );

  return interaction.editReply({
    components: [reductionContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "reduction_edit",
};
