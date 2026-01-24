const { getServerDatas } = require("../../../utils/functions/datas.js");
const {
  getSalaireContainer,
} = require("../../../components/salaireContainer.js");
const getServerCommand = require("../../../utils/functions/getServerCommand");
const proxyCommande = require("../../../utils/functions/proxyCmd");

exports.run = async (client, interaction, config) => {
  await proxyCommande(client, interaction, config);
};

exports.proxy = async (client, interaction, config) => {
  const { serveur, panel } = interaction.parametre;

  const panelId = interaction.options.getString("panel").toLowerCase();

  const serverDatas = await getServerDatas(interaction, serveur);
  const { error, component: salaireContainer } = await getSalaireContainer(
    client,
    serverDatas,
    panelId,
    serveur,
  );
  if (interaction.isMessageComponent()) {
    return interaction.update({
      components: [salaireContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } else {
    return interaction.reply({
      components: [salaireContainer],
      flags: error ? 32768 | 64 : 32768,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "salaire",
  description: "Affiche les salaires d'un rôle-play",
  options: [
    {
      type: 3,
      name: "panel",
      description: "Panel sur lequel voir les logs",
      autocomplete: true,
      required: true,
    },
  ],
  contexts: [0],
  async autocomplete(client, interaction, config) {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "panel") {
      const serveur = await getServerCommand(interaction.guild.id);
      if (!serveur) {
        return await interaction.respond([
          { name: "Sélectionne d'abord un serveur", value: "no-server" },
        ]);
      }

      try {
        const json = await getServerDatas(false, serveur);

        if (!json.panels || json.panels.length === 0) {
          return await interaction.respond([
            {
              name: "Aucun rôle-play trouvé pour ce serveur",
              value: "no-panel",
            },
          ]);
        }

        const panels = json.panels.map((p) => ({
          name: p.name,
          value: String(p.id),
        }));

        return await interaction.respond(panels.slice(0, 25));
      } catch (err) {
        return await interaction.respond([
          { name: "Erreur lors de la lecture des panels", value: "error" },
        ]);
      }
    }
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  permission: "super_moderateur",
};
