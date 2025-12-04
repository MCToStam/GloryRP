const fs = require("node:fs");
const path = require("node:path");
const config = require("../../config.js");

async function discordLink(discordId) {
  try {
    const url = discordId
      ? `${config.glorybot_url}/api/get-ng?discordId=${encodeURIComponent(discordId)}`
      : `${config.glorybot_url}/api/get-ng`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return discordId ? (data.pseudo ?? {}) : data;
    } else {
      console.warn("⚠️ API get-ng indisponible, utilisation du fichier local.");
    }
  } catch (err) {}

  try {
    const localData = JSON.parse(
      fs.readFileSync("../../data/data/api_get_ng.json", "utf8"),
    );
    return discordId ? (localData[discordId] ?? {}) : localData;
  } catch (err) {
    console.error(
      "❌ Erreur lors de la lecture du fichier api_get_ng.json :",
      err,
    );
    return {};
  }
}

async function discordStaff(discordId, serveur = "all") {
  const pseudonym = await discordLink(discordId);
  if (!pseudonym) return { pseudonym: null, servers: [] };

  if (config.developpeur.includes(discordId)) {
    return {
      pseudonym,
      servers:
        serveur === "all"
          ? config.liste_serveur
          : Array.isArray(serveur)
            ? serveur
            : [serveur],
    };
  }

  let allStaff = null;

  try {
    const response = await fetch(`${config.glorybot_url}/api/allStaff`, {
      headers: { Authorization: `Bearer ${config.glorybot_token}` },
    });

    if (!response.ok) throw new Error("API non fonctionnelle");

    allStaff = await response.json();
  } catch (err) {
    console.warn(
      "⚠️ Impossible d'accéder à /api/allStaff, utilisation des données locales...",
    );

    try {
      allStaff = JSON.parse(
        fs.readFileSync("../../data/data/api_api_all_staff.json", "utf8"),
      );
    } catch (fileErr) {
      console.error(
        "❌ Erreur lors de la récupération du fichier local :",
        fileErr,
      );
      return { pseudonym, servers: [] };
    }
  }

  try {
    const targetServers =
      serveur === "all"
        ? config.liste_serveur
        : Array.isArray(serveur)
          ? serveur
          : [serveur];

    const userServers = [];
    const pseudoLower = pseudonym.toLowerCase();

    for (const srvData of allStaff) {
      if (!targetServers.includes(srvData.serveur)) continue;

      if (!srvData._initialized) {
        srvData.administrateurSet = new Set(
          srvData.administrateur?.map((m) => m.toLowerCase()),
        );
        srvData.super_moderateurSet = new Set(
          srvData.super_moderateur?.map((m) => m.toLowerCase()),
        );
        srvData._initialized = true;
      }

      if (
        srvData.administrateurSet.has(pseudoLower) ||
        srvData.super_moderateurSet.has(pseudoLower)
      ) {
        userServers.push(srvData.serveur);
      }
    }

    return { pseudonym, servers: userServers };
  } catch (err) {
    return { pseudonym, servers: [] };
  }
}

module.exports = { discordLink, discordStaff };
