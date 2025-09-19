const fs = require("node:fs");
const path = require("node:path");
const {
  getServerDatas,
  getGuildColor,
} = require("../../utils/functions/datas.js");
const { MessageFlags } = require("discord.js");
const { getEditPanelContainer } = require("../../components/containers.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);

  const new_emoji = interaction.fields.getTextInputValue("new_emoji");

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

  panelDatas.emoji = new_emoji;

  const panelPath = path.join(
    __dirname,
    `../../data/servers/${guildColor}.json`
  );
  fs.writeFileSync(panelPath, JSON.stringify(serverDatas, null, 2), "utf8");

  const goodContainer = await getEditPanelContainer(panelId, guildColor, panelDatas);
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "panel_emoji",
};