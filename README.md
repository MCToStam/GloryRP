# GloryRP

![License](https://img.shields.io/github/license/MCToStam/GloryRP)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Contributions welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

> GloryRP, un outil dont le but est d'innover pour vos rôle-play de serveur sur NationsGlory. Que ce soit en temps que journaliste ou avocat, vous serez servit et ravit !

## ✨ Fonctionnalités

- ⚙️ Configuration simple et rapide
- 🤖 Automatisation des tâches répétitives
- 🗄️ Stockage des données avec MongoDB
- 🔧 Projet open source ouvert aux contributions

---

## 📋 Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version récente recommandée)
- [MongoDB](https://www.mongodb.com/)

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/MCToStam/GloryRP.git
cd GloryRP
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Renommez le fichier :

```text
.env.exemple
```

en

```text
.env
```

Puis complétez les informations suivantes :

```env
DISCORD_TOKEN=
MONGO_URI_GLORYRP=
MONGO_URI_GLORYPROJECTS=
NG_API_TOKEN=
GLORYBOT_TOKEN=
```

> **Important :** Une instance MongoDB fonctionnelle est nécessaire pour utiliser le bot.

---

## ▶️ Lancer le bot

Vous pouvez démarrer GloryRP de deux façons :

Avec npm :

```bash
npm start
```

Ou directement avec Node.js :

```bash
node index.js
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

Si vous souhaitez améliorer GloryRP :

1. Forkez le projet
2. Créez une branche (`feature/ma-fonctionnalite`)
3. Effectuez vos modifications
4. Committez vos changements
5. Ouvrez une Pull Request

Toutes les idées, corrections de bugs et nouvelles fonctionnalités sont appréciées.

---

## 📄 Licence

Ce projet est distribué sous la licence **Apache License 2.0**.

Vous êtes libre de l'utiliser, le modifier et le redistribuer conformément aux conditions de cette licence.

---

## ❤️ Remerciements

Merci à toutes les personnes qui contribuent au développement de GloryRP !
