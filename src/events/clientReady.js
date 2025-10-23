const {
  ActivityType,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const config = require("../../config.js");
const log = require("../../utils/modules/logger.js");
const { getDateTs } = require("../../utils/functions/numbersAndLetters.js");
const { botLaunch } = require("../../index.js");
const { checkEmojiCache } = require("../../utils/functions/emojis.js");
const { salaireAutomatique } = require("../../utils/functions/salairePost.js");
const { updateLogo } = require("../../utils/functions/updateLogo.js");
const cron = require("node-cron");
const {
  checkCandidature,
} = require("../../utils/functions/checkCandidature.js");
const {
  checkDepotDePlainte,
} = require("../../utils/functions/checkDepotDePlainte.js");
const {
  checkDeletePanel,
} = require("../../utils/functions/checkDeletePanel.js");

async function getPlayerCount(server) {
  try {
    var response = await fetch(
      `${config.glorybot_url}/api/joueurConnecte?serveur=${server}&administrator=true`,
    );
    var response = await response.json();
    if (
      Array.isArray(response) &&
      response.length > 0 &&
      response[0].nombre !== undefined
    ) {
      return response[0].nombre;
    }
  } catch (error) {}
  return null;
}

async function cycleStatus(client, statusIndex) {
  const server = config.liste_serveur[statusIndex];
  const playerCount = await getPlayerCount(server);

  const statusName =
    playerCount !== null
      ? `${playerCount} joueurs connectés sur NationsGlory ${server.toUpperCase()}`
      : `NationsGlory`;

  client.user.setPresence({
    activities: [{ name: statusName, type: ActivityType.Watching }],
    status: "online",
  });

  statusIndex = (statusIndex + 1) % config.liste_serveur.length;
}

module.exports = async (client, interaction) => {
  const chanCmds = client.channels.cache.get(config.salon.dev.cmd);
  chanCmds.send("**✅ | BOT ON !**");

  const botStart = new Date();
  const latence = (botStart.getTime() - botLaunch[0].getTime()) / 1000;

  const chanStatus = client.channels.cache.get(config.salon.dev.statut);
  const guilds = client.guilds.cache.size;
  const usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  const readyContainer = {
    type: 17,
    accent_color: config.colors.statut,
    components: [
      {
        type: 10,
        content: `## :robot: | Robot lancé en ${latence.toFixed(1)}s`,
      },
      {
        type: 14,
        spacing: SeparatorSpacingSize.Large,
      },
      {
        type: 10,
        content: getDateTs(client.readyAt, "R"),
      },
    ],
  };
  chanStatus.send({
    components: [readyContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });

  log(
    `${client.user.username} est pret en ${latence.toFixed(
      1,
    )}s, sur ${guilds} serveurs et ${usersCount} utilisateurs.`,
    "READY",
    "green",
  );

  await cycleStatus(client, 0);

  setInterval(() => {
    cycleStatus(client, 0);
  }, 30000);
  checkEmojiCache(client);

  cron.schedule("*/30 * * * *", async () => {
    try {
      await checkDeletePanel();
      await checkDepotDePlainte(client);
      await checkCandidature(client);
    } catch (err) {
      log(
        "Erreur lors de la vérification des candidatures, dépot de plainte ou de suppression d'un panel :" +
          err,
        "ERROR",
        "red",
      );
    }
  });

  cron.schedule(
    "0 10 1 * *",
    async () => {
      await salaireAutomatique(client);
    },
    {
      timezone: "Europe/Paris",
    },
  );

  cron.schedule("0 0 * * *", async () => {
    await updateLogo(client, config);
  });
};
