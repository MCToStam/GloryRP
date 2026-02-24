const config = require("../../config.js");
const log = require("../../utils/modules/logger.js");
const { getDateTs } = require("../../utils/functions/numbersAndLetters.js");
const { botLaunch } = require("../../index.js");
const { checkEmojiCache } = require("../../utils/functions/emojis.js");
const { salaireAutomatique } = require("../../utils/functions/salairePost.js");
const { salaireFix } = require("../../utils/functions/salaireFix.js");
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
  checkDeleteBoutique,
} = require("../../utils/functions/checkDeletePanel.js");
const {
  cacheApiGloryBot,
} = require("../../utils/functions/cacheApiGloryBot.js");

const { cycleStatus } = require("../../utils/functions/basics.js");
const { zipAndUpload } = require("../../utils/functions/backupData.js");
const connectMongo = require("../../utils/database/index.js");

module.exports = async (client, interaction) => {
  await connectMongo();
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
        spacing: 2,
      },
      {
        type: 10,
        content: getDateTs(client.readyAt, "R"),
      },
    ],
  };
  chanStatus.send({
    components: [readyContainer],
    flags: 32768,
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
      await checkDeleteBoutique();
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
      await salaireFix();
    },
    {
      timezone: "Europe/Paris",
    },
  );

  cron.schedule(
    "0 0,12 * * *",
    async () => {
      await cacheApiGloryBot();
    },
    {
      timezone: "Europe/Paris",
    },
  );

  cron.schedule("0 0 * * *", async () => {
    await updateLogo(client, config);
    zipAndUpload();
  });

  process.on("unhandledRejection", (reason, p) => {
    log(`${reason} ${p}`, "ERROR", "red");
  });
  process.on("uncaughtException", (err, origin) => {
    log(`${err} ${origin}`, "ERROR", "red");
  });
  process.on("uncaughtExceptionMonitor", (err, origin) => {
    log(`${err} ${origin}`, "ERROR", "red");
  });
};
