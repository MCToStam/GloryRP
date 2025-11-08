const config = require("../../config.js");

async function discordLink(discordId = null) {
  try {
    let url = `${config.glorybot_url}/api/get-ng`;
    if (discordId !== null) {
      url += `?discordId=${encodeURIComponent(discordId)}`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    return discordId !== null ? data.pseudo || null : data;
  } catch (e) {
    return null;
  }
}

async function discordStaff(discordId, serveur = "all") {
  const pseudonym = await discordLink(discordId);
  if (!pseudonym) return { pseudonym: null, servers: [] };

  const serveurs = serveur === "all" ? config.liste_serveur : [serveur];

  if (config.developpeur.includes(discordId)) {
    return { pseudonym, servers: serveurs };
  }

  try {
    const response = await fetch(`${config.glorybot_url}/api/allStaff`, {
      headers: {
        Authorization: `Bearer ${config.glorybot_token}`,
      },
    });

    if (!response.ok) throw new Error(`Erreur API allStaff`);

    const allStaffData = await response.json();

    const servers = [];

    for (const srv of serveurs) {
      const data = allStaffData.find((s) => s.serveur === srv);
      if (!data) continue;

      const isAdmin = data.administrateur?.includes(pseudonym);
      const isSuperMod = data.super_moderateur?.includes(pseudonym);

      if (isAdmin || isSuperMod) {
        servers.push(srv);
      }
    }

    return { pseudonym, servers };
  } catch (err) {
    return { pseudonym, servers: [] };
  }
}

module.exports = { discordLink, discordStaff };
