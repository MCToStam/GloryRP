const config = require("../../config.js");

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
    activities: [{ name: statusName, type: 3 }],
    status: "online",
  });

  statusIndex = (statusIndex + 1) % config.liste_serveur.length;
}

module.exports = { getPlayerCount, cycleStatus };
