const config = require("../../config.js");
const { discordLink } = require("../../utils/functions/linkedUser.js");
const {
  getServerDatas,
  saveServerDatas,
} = require("../../utils/functions/datas.js");

async function salaireFix() {
  const d = new Date();
  const date = `${String(d.getMonth() + 1).padStart(2, "0")}_${d.getFullYear()}`;

  for (const serveur of config.liste_serveur) {
    const datas = await getServerDatas(false, serveur);
    for (const panel of datas.panels) {
      for (const grade of panel.grade) {
        if (panel.salaire?.automatique) {
          if (grade.salaire_fix && grade.salaire_fix > 0) {
            for (const id of grade.listeRp) {
              const pseudo = await discordLink(id);
              if (!panel.salaire.salaire[pseudo])
                panel.salaire.salaire[pseudo] = {};
              if (!panel.salaire.salaire[pseudo][date])
                panel.salaire.salaire[pseudo][date] = { taches: [] };
              panel.salaire.salaire[pseudo][date].taches.push({
                nom: "Salaire Fix Automatique",
                emoji: false,
                lien: false,
                details: false,
                timestamp: false,
                status: "bonus",
                staff: false,
                argent: grade.salaire_fix,
                messageId: false,
              });
            }
          }
        }
      }
    }

    await saveServerDatas(false, datas, serveur);
  }
}

module.exports = { salaireFix };
