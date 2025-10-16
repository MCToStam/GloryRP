const fs = require("node:fs");
const path = require("node:path");
const config = require("../../config.js");
const { saveServerDatas, getServerDatas } = require("./datas.js");

async function checkDeletePanel() {
  for (const serveur of config.liste_serveur) {
    try {
      const serverDatas = await getServerDatas(false, serveur);
      let modified = false;

      const toDelete = [];

      for (const panel of serverDatas.panels) {
        if (panel.delete) {
          const now = Math.floor(Date.now() / 1000);
          if (now >= panel.delete) {
            console.log(
              `[CHECK] Suppression du panel ${panel.id} sur ${serveur}`,
            );
            toDelete.push(panel.id);
            modified = true;
          }
        }
      }

      if (toDelete.length > 0) {
        serverDatas.logs = serverDatas.logs.filter(
          (log) => !toDelete.includes(log.panel),
        );
        serverDatas.panels = serverDatas.panels.filter(
          (p) => !toDelete.includes(p.id),
        );
      }

      if (modified) {
        await saveServerDatas(false, serverDatas, serveur);
      }
    } catch (err) {
      console.error(`[ERREUR] checkDeletePanel sur ${serveur}:`, err);
    }
  }
}

module.exports = { checkDeletePanel };
