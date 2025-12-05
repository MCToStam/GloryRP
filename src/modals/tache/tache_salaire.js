const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { getEditTacheContainer } = require("../../../components/containers.js");
const {
  toTimeStamp,
} = require("../../../utils/functions/numbersAndLetters.js");

exports.run = async (client, interaction, config) => {
  const panelId = Number(interaction.customId.split("-")[1]);
  const taskId = Number(interaction.customId.split("-")[2]);

  const jour = interaction.fields.getStringSelectValues("jour")[0];
  const new_salaire = interaction.fields.getTextInputValue("new_salaire");

  const salaireNumber = Number(new_salaire.replace(/\./g, ""));
  if (isNaN(salaireNumber)) {
    const errorContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: `## :no_entry: Salaire non Valide`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
        {
          type: 10,
          content: "Le salaire doit être un nombre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] },
    });
  }

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const panelDatas = serverDatas.panels.find((x) => x.id === panelId);
  const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

  const modifDate = await toTimeStamp(new Date());

  let jour_text;
  if (jour.toLowerCase() === "all") {
    jour_text = "tous les jours";
    for (const key of Object.keys(tache.salaire)) {
      tache.salaire[key] = salaireNumber;
    }
  } else {
    jour_text = `le ${jour}`;
    if (tache.salaire[jour] !== undefined) {
      tache.salaire[jour] = salaireNumber;
    } else {
      return interaction.reply({
        content: `❌ Jour invalide : ${jour}`,
        ephemeral: true,
      });
    }
  }

  if (!serverDatas.logs) serverDatas.logs = [];
  serverDatas.logs.push({
    user: interaction.user.id,
    timestamp: modifDate,
    panel: panelId,
    action: `Modification du salaire de la tâche ${tache.name} en ${new_salaire} ${jour_text}`,
  });

  await saveServerDatas(interaction, serverDatas, guildColor);

  const goodContainer = await getEditTacheContainer(
    client,
    panelId,
    guildColor,
    panelDatas,
    taskId,
  );
  return interaction.update({
    components: [goodContainer],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "edit_tache_salaire",
};
