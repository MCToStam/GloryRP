const fs = require("node:fs");
const express = require("express");
const { getServerDatas, saveServerDatas } = require("./utils/functions/datas");

const app = express();
const PORT = 20428;

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "GloryRP");
  next();
});

const rateLimits = new Map();

function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!rateLimits.has(ip)) {
      rateLimits.set(ip, []);
    }

    const requests = rateLimits.get(ip).filter((time) => now - time < windowMs);

    if (requests.length >= max) {
      return res.status(429).json({
        error: "Trop de requêtes, veuillez réessayer plus tard.",
      });
    }

    requests.push(now);
    rateLimits.set(ip, requests);

    next();
  };
}

const payementLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
});

app.get("/:token", payementLimiter, async (req, res) => {
  const token = req.params.token;

  const tokens = JSON.parse(fs.readFileSync("./data/tokenApiPaiement.json"));
  const tokenObj = tokens.find((t) => t.token === token);
  if (!tokenObj) {
    return res.sendStatus(403);
  }

  const { pseudonyme, argent } = req.query;

  const ua = req.headers["user-agent"] || "";
  const accept = req.headers["accept"] || "";

  if (!ua.includes("Java")) {
    return res.sendStatus(403);
  }

  if (!accept.includes("image/jpeg") || !accept.includes("*; q=.2")) {
    return res.sendStatus(403);
  }

  if (/mozilla|chrome|safari|firefox|edge/i.test(ua)) {
    return res.sendStatus(403);
  }

  if (Number(argent) <= 0) {
    return res.sendStatus(403);
  }

  const datas = await getServerDatas(false, tokenObj.serveur);
  const boutique = datas.boutiques.find((b) => b.id === tokenObj.boutiqueId);
  const reelPseudo = Object.keys(boutique.paiement.donnee).find(
    (pseudoFile) => pseudoFile === pseudonyme,
  );

  const pseudoKey = reelPseudo || pseudonyme;

  if (!boutique.paiement.donnee[pseudoKey])
    boutique.paiement.donnee[pseudoKey] = 0;
  boutique.paiement.donnee[pseudoKey] += Number(argent);

  saveServerDatas(false, datas, tokenObj.serveur);

  res.setHeader("Content-Type", "image/png");

  fs.createReadStream("./data/paiement.png").pipe(res);
});

app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
