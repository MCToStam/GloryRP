const { MessageFlags, time, userMention } = require("discord.js");
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
    const channelId = interaction.values.length === 0 ? false : interaction.values[0];
    const panelId = Number(interaction.customId.split("-")[1]);

    const serverDatas = await getServerDatas(interaction);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    const modifDate = await toTimeStamp(new Date());
    serverDatas.timestamp = modifDate;
    panelDatas.timestamp = modifDate;
    const guildColor = await getGuildColor(interaction);

    const channel = interaction.customId.split("-")[3];
    const logMap = {
      logs: "Édition du salon des logs",
      responsable: "Édition du salon de responsable",
      tasks: "Édition du salon des tâches",
      salaire: "Édition du salon de salaire",
      effectif: "Édition du salon d'effectif"
    }
    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      panel: panelId,
      action: logMap[channel],
    });
    panelDatas.channels[channel] = channelId;

    await saveServerDatas(interaction, serverDatas, guildColor)
    const components = interaction.message.components.map((row) =>
      row.toJSON()
    );
    for (const row of components) {
      for (const comp of row.components.filter((x) => x.type == 10)) {
        if (comp.content.startsWith("-# Dernières modifications par ")) {
          comp.content =
            "-# Dernières modifications par " +
            userMention(panelDatas.lastUser) +
            " " +
            (await time(panelDatas.timestamp, "R"));
        }
      }
    }
    await interaction.message.edit({
      components: components,
      allowedMentions: { parse: [] }
    });
  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de l'écriture de vos données !**`,
      flags: MessageFlags.Ephemeral,
    });
  }
};

exports.data = { name: "config" };
