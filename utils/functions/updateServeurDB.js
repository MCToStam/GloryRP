const Serveur = require("../../utils/database/models/Serveur");

async function updateServeurDB(client) {
  const guildIds = client.guilds.cache.map((guild) => guild.id);

  await Serveur.findOneAndUpdate(
    { robot: "GloryRP" },
    { serveur: guildIds },
    { upsert: true },
  );
}

module.exports = updateServeurDB;
