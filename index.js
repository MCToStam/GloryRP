if (Number(process.version.slice(1).split(".")[0]) < 19)
  throw new Error("Node 19.x is required. Update Node on your system.");
require("dotenv").config({ quiet: true });

const { Client, Collection, IntentsBitField } = require("discord.js");
const { readdirSync, statSync } = require("node:fs");
const pathModule = require("node:path");
const { intents, partials } = require("./config.js");
const log = require("./utils/modules/logger.js");
const botLaunch = [];
const myIntents = new IntentsBitField();
myIntents.add(intents);
const client = new Client({ intents: myIntents, partials: partials });

const slashCmds = new Collection();
client.cooldowns = new Collection();
const userCmds = new Collection();
const msgCmds = new Collection();
const buttons = new Collection();
const stringSelects = new Collection();
const channelSelects = new Collection();
const roleSelects = new Collection();
const modals = new Collection();

client.container = {
  slashCmds,
  userCmds,
  msgCmds,
  buttons,
  stringSelects,
  channelSelects,
  roleSelects,
  modals,
};

const init = async () => {
  async function load(type, dirPath, typeLog) {
    function getFilesRecursively(dir) {
      let results = [];
      const list = readdirSync(dir);

      for (const file of list) {
        const fullPath = pathModule.join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          results = results.concat(getFilesRecursively(fullPath));
        } else if (file.endsWith(".js")) {
          results.push(fullPath);
        }
      }

      return results;
    }

    const files = getFilesRecursively(dirPath);

    for (const file of files) {
      const fullPath = pathModule.resolve(file);
      const command = require(fullPath);
      const commandName = pathModule.basename(file, ".js");

      log(`✅ Chargement ${typeLog}: ${commandName}`, "LOG", "gray");
      client.container[type].set(command.data.name, command);
    }
  }

  botLaunch.push(new Date());
  await load("slashCmds", "./src/commands/slash", "Slash command");
  await load("userCmds", "./src/commands/user", "User command");
  await load("msgCmds", "./src/commands/message", "Message command");
  await load("buttons", "./src/buttons", "Button");
  await load("stringSelects", "./src/selects/strings", "String select");
  await load("channelSelects", "./src/selects/channels", "Channel select");
  await load("roleSelects", "./src/selects/roles", "Role select");
  await load("modals", "./src/modals", "Modals");

  const eventFiles = readdirSync("./src/events/").filter((file) =>
    file.endsWith(".js"),
  );

  for (const file of eventFiles) {
    const eventName = file.split(".")[0];
    log(`Loading Event: ${eventName}. 👌`, "LOG", "gray");
    const event = require(`./src/events/${file}`);
    client.on(eventName, event.bind(null, client));
  }

  client.login(); /*.then(async () => {
    const config = require("./config.js");
    const guild = client.guilds.cache.get(config.guilds.dev);
    const guildCmds = guild.commands;
    const cmd = client.container.slashCmds;
    const cmdSlashs = cmd.filter((c) => c.data.name === "cmd");
    await guildCmds
      .set(cmdSlashs.map((c) => c.data))
      .catch((e) => console.log(e));
  });*/
  log(`Node ${process.version} !`, "READY", "green");
};

init();
module.exports = { botLaunch };
