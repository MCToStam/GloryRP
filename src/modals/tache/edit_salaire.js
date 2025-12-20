const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const { getEditTacheContainer } = require("../../../components/containers");
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
          spacing: 2,
        },
        {
          type: 10,
          content: "Le salaire doit être un nombre.",
        },
      ],
    };

    return await interaction.reply({
      components: [errorContainer],
      flags: 32768 | 64,
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

  serverDatas.lastUser = interaction.user.id;
  serverDatas.timestamp = modifDate;

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
    flags: 32768 | 64,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "tache_edit_salaire",
};
