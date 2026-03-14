const mongoose = require("mongoose");
const log = require("../../utils/modules/logger");

let GloryProjectsConnection;
let GloryRPConnection;

async function connectMongo() {
  try {
    GloryProjectsConnection = await mongoose.createConnection(
      process.env.MONGO_URI_GLORYPROJECTS,
    );

    GloryRPConnection = await mongoose.createConnection(
      process.env.MONGO_URI_GLORYRP,
    );

    log("MongoDB est correctement connecté", "READY", "green");
  } catch (err) {
    log(`❌ Erreur lors de la connexion à MongoDB : ${err}`, "error", "red");
  }
}

module.exports = {
  connectMongo,
  getGloryProjectsConnection: () => GloryProjectsConnection,
  getGloryRPConnection: () => GloryRPConnection,
};
