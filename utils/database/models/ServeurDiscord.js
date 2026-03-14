const mongoose = require("mongoose");

const { getGloryRPConnection } = require("../index");

const GloryRPConnection = getGloryRPConnection();

const serveurDiscordSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  serveur: { type: String, required: true },
});

module.exports = GloryRPConnection.model(
  "ServeurDiscord",
  serveurDiscordSchema,
);
