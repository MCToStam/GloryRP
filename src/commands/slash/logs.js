const { getServerDatas } = require("../../../utils/functions/datas.js");
const getServerCommand = require("../../../utils/functions/getServerCommand");
const { getLogContainer } = require("../../../components/logContainer.js");
const proxyCommande = require("../../../utils/functions/proxyCmd");

exports.run = async (client, interaction, config) => {
  await proxyCommande(client, interaction, config);
};

exports.proxy = async (client, interaction, config) => {
  const { serveur, panel } = interaction.parametre;

  const [type, panelId] = panel.split("-");

  const serverDatas = await getServerDatas(interaction, serveur);
  const { error, component: logContainer } = await getLogContainer(
    serverDatas,
    panelId,
    serveur,
    1,
    type,
  );

  if (interaction.isMessageComponent()) {
    return interaction.update({
      components: [logContainer],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } else {
    return interaction.reply({
      components: [logContainer],
      flags: error ? 32768 | 64 : 32768,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "logs",
  description: "Affiche les logs des modifications des panels rôle-play",
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
      const serveur = await getServerCommand(
        interaction.guild.id,
        interaction.user.id,
      );
      if (!serveur) {
        return await interaction.respond([
          { name: "Sélectionne d'abord un serveur", value: "no-server" },
        ]);
      }

      const focusedValue =
        interaction.options.getFocused()?.toLowerCase() ?? "";
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
        name: `[Rôle-Play] ${p.name}`,
        value: `panel-${String(p.id)}`,
      }));

      const boutiques = json.boutiques.map((b) => ({
        name: `[Boutique] ${b.name}`,
        value: `boutique-${String(b.id)}`,
      }));

      const donnee = [...panels, ...boutiques].filter((data) =>
        data.name.toLowerCase().includes(focusedValue),
      );

      return await interaction.respond(donnee.slice(0, 25));
    }
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  permission: "super_moderateur",
};
