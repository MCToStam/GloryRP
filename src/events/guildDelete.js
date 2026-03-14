const updateServeurDB = require("../../utils/functions/updateServeurDB.js");

module.exports = async (client, guild) => {
  try {
    await updateServeurDB(client);
  } catch (err) {
    console.error("Erreur lors du traitement du départ :", err);
  }
};
