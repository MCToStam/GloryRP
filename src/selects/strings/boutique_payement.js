const {
  getBoutiquePaiementContainer,
} = require("../../../components/containers");
const {
  getServerDatas,
  getGuildColor,
  saveServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const [_, boutiqueIdStr, type] = interaction.values[0].split("-");
  const boutiqueId = Number(boutiqueIdStr);

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  if (type) {
    const modifDate = await toTimeStamp(new Date());
    serverDatas.logs ??= [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      boutique: boutiqueId,
      action: `Modification du mode de paiement de ${boutiqueDatas.paiement.mode} en ${type}`,
    });

    serverDatas.lastUser = interaction.user.id;
    serverDatas.timestamp = modifDate;

    boutiqueDatas.paiement.mode = type;

    await saveServerDatas(interaction, serverDatas, guildColor);
  }

  const paiementContainer = await getBoutiquePaiementContainer(
    boutiqueId,
    guildColor,
    boutiqueDatas,
  );

  return interaction.update({
    components: [paiementContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "boutique_paiement",
};
