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

  const servers = [];

  await Promise.all(
    serveurs.map(async (srv) => {
      try {
        const response = await fetch(
          `${config.glorybot_url}/api/serveur?serveur=${srv}`,
          {
            headers: {
              Authorization: `Bearer ${config.glorybot_token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`Erreur serveur ${srv}`);

        const data = await response.json();

        const isAdmin =
          data.staff?.administrateur?.includes(pseudonym) ?? false;
        const isSuperMod =
          data.staff?.super_moderateur?.includes(pseudonym) ?? false;

        if (isAdmin || isSuperMod) {
          servers.push(srv);
        }
      } catch (err) {
        console.error(`Erreur sur le serveur ${srv}:`, err);
      }
    })
  );

  return { pseudonym, servers };
}

module.exports = { discordLink, discordStaff };