const {
  getGuildColor,
  saveServerDatas,
  getServerDatas,
} = require("../../../utils/functions/datas.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  try {
    await interaction.deferUpdate();
    const rolesId = interaction.values;
    const panelId = Number(interaction.customId.split("-")[1]);

    const serverDatas = await getServerDatas(interaction);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    const modifDate = await toTimeStamp(new Date());
    serverDatas.timestamp = modifDate;
    panelDatas.timestamp = modifDate;
    const guildColor = await getGuildColor(interaction);

    const type = interaction.customId.split("-")[3];
    const logMap = {
      salaire: "Édition du rôle mentionné lors de salaire",
    };
    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      panel: panelId,
      action: logMap[type],
    });
    panelDatas.roles[type] = rolesId;

    await saveServerDatas(interaction, serverDatas, guildColor);
    const components = interaction.message.components.map((row) =>
      row.toJSON(),
    );
    for (const row of components) {
      for (const comp of row.components.filter((x) => x.type == 10)) {
        if (comp.content.startsWith("-# Dernières modifications par ")) {
          comp.content = `-# Dernières modifications par <@${panelDatas.lastUser}> <t:${panelDatas.timestamp}:R>`;
        }
      }
    }
    await interaction.message.edit({
      components: components,
      allowedMentions: { parse: [] },
    });
  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de l'écriture de vos données !**`,
      flags: 64,
    });
  }
};

exports.data = { name: "config" };
