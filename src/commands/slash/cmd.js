const config = require("../../../config.js");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction) => {
  const subCmd = interaction.options.getSubcommand();
  const canal = interaction.options.getString("canal");
  const server = interaction.options.getString("server");
  const guild = server ? client.guilds.cache.get(server) : interaction.guild;

  const globalCmds = client.application.commands;
  const guildCmds = guild.commands;
  const { container } = client;
  const slashCmds = container.slashCmds;

  const guildId = guild.id;
  if (guildId === config.guilds.dev) {
    var cmds = slashCmds;
  } else {
    var cmds = slashCmds.filter((c) => c.data.name !== "cmd");
  }

  const deployMsg = `**✅ | Les commandes ont été déployées sur le {{CANAL}} \`{{CANAL_NAME}}\` !**`;
  const removeMsg = `**✅ | Les commandes présentes sur le {{CANAL}} \`{{CANAL_NAME}}\` ont été supprimées !**`;

  if (subCmd === "deploy") {
    if (canal === "global") {
      return globalCmds
        .set(cmds.filter((c) => c.data.name === "ping").map((c) => c.data))
        .then(() => {
          const msg = deployMsg
            .replace("{{CANAL}}", "canal")
            .replace("{{CANAL_NAME}}", "global");
          interaction.reply({ content: msg, flags: 64 });
        })
        .catch((e) => console.error(e));
    } else {
      return guildCmds
        .set(cmds.map((c) => c.data))
        .then(() => {
          const msg = deployMsg
            .replace("{{CANAL}}", "serveur")
            .replace("{{CANAL_NAME}}", guild.name);
          interaction.reply({ content: msg, flags: 64 });
        })
        .catch((e) => console.error(e));
    }
  } else if (subCmd === "remove") {
    if (canal === "global") {
      return globalCmds
        .set([])
        .then(() => {
          const msg = removeMsg
            .replace("{{CANAL}}", "canal")
            .replace("{{CANAL_NAME}}", "global");
          interaction.reply({ content: msg, flags: 64 });
        })
        .catch((e) => console.error(e));
    } else {
      return guildCmds
        .set(cmds.filter((c) => c.data.name === "cmd").map((c) => c.data))
        .then(() => {
          const msg = removeMsg
            .replace("{{CANAL}}", "serveur")
            .replace("{{CANAL_NAME}}", guild.name);
          interaction.reply({ content: msg, flags: 64 });
        })
        .catch((e) => console.error(e));
    }
  } else if (subCmd === "edit") {
    const collection = slashCmds;
    const name = interaction.options.getString("name");
    const command = slashCmds.get(name);

    if (!command) {
      return interaction.reply({
        content: `**❌ | \`${name}\` n'existe pas.**`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const folder = `./`;
    const data = command.data.name;

    delete require.cache[require.resolve(`${folder}${data}.js`)];
    await collection.delete(data);

    const props = require(`${folder}${data}.js`);
    await collection.set(data, props);

    let msg = `**✅ | La commande \`${data}\` a été rechargée !**`;

    return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
  }
};

exports.data = {
  name: "cmd",
  description: "⛔ Gestionnaire de commandes slash.",
  options: [
    {
      type: 1,
      name: "deploy",
      description: "⛔ Déploiement des commandes",
      options: [
        {
          type: 3,
          name: "canal",
          description: "Canal de déploiement",
          choices: [
            {
              name: "global",
              value: "global",
            },
          ],
          required: false,
        },
        {
          type: 3,
          name: "server",
          description: "ID du serveur",
          autocomplete: true,
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "remove",
      description: "⛔ Supression des commandes",
      options: [
        {
          type: 3,
          name: "canal",
          description: "Canal de supression",
          choices: [
            {
              name: "global",
              value: "global",
            },
          ],
          required: false,
        },
        {
          type: 3,
          name: "server",
          description: "ID du serveur",
          autocomplete: true,
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "edit",
      description: "⛔ Édition d'une commande",
      options: [
        {
          type: 3,
          name: "name",
          description: "Nom de la commande",
          autocomplete: true,
          required: true,
        },
      ],
    },
  ],
  contexts: [0],
  async autocomplete(client, interaction) {
    const focusedValue = interaction.options.getFocused(true);
    const optionName = focusedValue.name;

    if (optionName === "name") {
      const { container } = client;
      const slashCmds = container.slashCmds;

      const cmdsDatas = slashCmds
        .filter((x) =>
          x.data.name.toLowerCase().includes(focusedValue.value.toLowerCase())
        )
        .map((x) => ({ name: x.data.name, value: x.data.name }))
        .slice(0, 25);

      return interaction.respond(cmdsDatas);
    }

    if (optionName === "server") {
      const servers = client.guilds.cache
        .filter(
          (g) =>
            g.name.toLowerCase().includes(focusedValue.value.toLowerCase()) ||
            g.id.includes(focusedValue.value)
        )
        .map((g) => ({
          name: `${g.name} (${g.id})`,
          value: g.id,
        }))
        .slice(0, 25);

      return interaction.respond(servers);
    }
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
