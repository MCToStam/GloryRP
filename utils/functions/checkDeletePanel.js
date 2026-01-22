const config = require("../../config.js");
const { saveServerDatas, getServerDatas } = require("./datas.js");

async function checkDelete(type, label) {
  for (const serveur of config.liste_serveur) {
    try {
      const serverDatas = await getServerDatas(false, serveur);
      let modified = false;

      const items = serverDatas[type];
      const toDelete = [];
      const now = Math.floor(Date.now() / 1000);

      for (const item of items) {
        if (item.delete && now >= item.delete) {
          console.log(
            `[CHECK] Suppression du ${label} ${item.id} sur ${serveur}`,
          );
          toDelete.push(item.id);
          modified = true;
        }
      }

      if (toDelete.length > 0) {
        serverDatas.logs = serverDatas.logs.filter(
          (log) => !toDelete.includes(log[type.slice(0, -1)]),
        );

        serverDatas[type] = items.filter((i) => !toDelete.includes(i.id));
      }

      if (modified) {
        await saveServerDatas(false, serverDatas, serveur);
      }
    } catch (err) {
      console.error(`[ERREUR] checkDelete(${label}) sur ${serveur}:`, err);
    }
  }
}

async function checkDeletePanel() {
  return checkDelete("panels", "panel");
}

async function checkDeleteBoutique() {
  return checkDelete("boutiques", "boutique");
}

module.exports = { checkDeletePanel, checkDeleteBoutique };
