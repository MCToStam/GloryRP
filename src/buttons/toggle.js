const { MessageFlags } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { toTimeStamp } = require("../../utils/functions/numbersAndLetters.js");
const { getConfigContainer, getPanelContainer } = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  try {
    await interaction.deferUpdate();

    const panelId = Number(interaction.customId.split("-")[2]);
    const menu = interaction.customId.split("-")[3];

    let serverDatas = await getServerDatas(interaction);
    const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

    const guildColor = await getGuildColor(interaction);
    const panelPath = path.join(__dirname, `../../data/servers/${guildColor}.json`);
    const modifDate = await toTimeStamp(new Date());

    panelDatas.enable = !panelDatas.enable;
    serverDatas.timestamp = modifDate;
    serverDatas.lastUser = interaction.user.id;
    panelDatas.timestamp = modifDate;
    panelDatas.lastUser = interaction.user.id;

    if (!serverDatas.logs) serverDatas.logs = [];
    serverDatas.logs.push({
      user: interaction.user.id,
      timestamp: modifDate,
      panel: panelId,
      action: panelDatas.enable ? "Activation du module" : "Désactivation du module",
    });

    fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2));

    serverDatas = JSON.parse(fs.readFileSync(panelPath, "utf-8"));
    const updatedPanelDatas = serverDatas.panels.find((x) => x.id === panelId);

    let components;
    if (menu === "acceuil") {
      components = await getConfigContainer(serverDatas, guildColor);
    } else if (menu === "panel") {
      components = await getPanelContainer(guildColor, updatedPanelDatas, panelId);
    }

    return await interaction.message.edit({ components: [components], allowedMentions: { parse: [] } });

  } catch (e) {
    console.error(e);
    return interaction.reply({
      content: `:x: **| Une erreur a eu lieu lors de l'écriture de vos données !**`,
      flags: MessageFlags.Ephemeral,
    });
  }
};

exports.data = {
  name: "toggle",
};

exports.conf = {
  type: "User",
};