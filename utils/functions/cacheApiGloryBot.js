const fs = require("node:fs");
const path = require("node:path");
const config = require("../../config");

async function cacheApiGloryBot() {
  try {
    console.log("📥 Récupération des données depuis l'API GloryBot...");

    const [getNgResponse, allStaffResponse] = await Promise.all([
      fetch(`${config.glorybot_url}/api/get-ng`, {
        headers: { Authorization: `Bearer ${process.env.GLORYBOT_TOKEN}` },
      }),
      fetch(`${config.glorybot_url}/api/allStaff`, {
        headers: { Authorization: `Bearer ${process.env.GLORYBOT_TOKEN}` },
      }),
    ]);

    if (!getNgResponse.ok) throw new Error("❌ Erreur API /api/get-ng");
    if (!allStaffResponse.ok) throw new Error("❌ Erreur API /api/allStaff");

    const [dataNg, dataStaff] = await Promise.all([
      getNgResponse.json(),
      allStaffResponse.json(),
    ]);

    const fileNg = path.join(__dirname, "../../data", "api_get_ng.json");
    const fileStaff = path.join(__dirname, "../../data", "api_all_staff.json");

    fs.writeFileSync(fileNg, JSON.stringify(dataNg, null, 2), "utf8");
    fs.writeFileSync(fileStaff, JSON.stringify(dataStaff, null, 2), "utf8");

    console.log("📦 Données enregistrées avec succès GloryBot !");
  } catch (err) {
    console.error("❌ Erreur lors de la récupération/enregistrement :", err);
  }
}

module.exports = { cacheApiGloryBot };
