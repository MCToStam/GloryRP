const config = require("../../../config.js");
const fs = require("node:fs");
const path = require("node:path");
const { updateEffectif } = require("../../../utils/functions/effectif.js");
const {
  InteractionContextType,
  SeparatorSpacingSize,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getServerDatas } = require("../../../utils/functions/datas.js");
const { createCanvas, loadImage } = require("canvas");

function getContrastTextColor(colorNumber) {
  const hex = colorNumber.toString(16).padStart(6, "0");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180 ? "#55545B" : "#FBF0CA";
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? " " : "") + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y + offsetY);
      line = words[n];
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + offsetY);
}

function drawRoundedHexagonPath(ctx, x, y, width, height, radius) {
  const points = [
    { x: x + width / 2, y: y },
    { x: x + width, y: y + height / 4 },
    { x: width + x, y: y + (height * 3) / 4 },
    { x: x + width / 2, y: y + height },
    { x: x, y: y + (height * 3) / 4 },
    { x: x, y: y + height / 4 },
  ];

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius);
  }

  ctx.closePath();
}

exports.run = async (client, interaction, config) => {
  try {
    const serveur = interaction.options.getString("serveur").toLowerCase();
    if (serveur === "non-lie") {
      const nonLieContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Compte non Lié",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content:
              'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.',
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "💻 Accéder au panel",
                url: "https://glorybot.fr",
                style: ButtonStyle.Link,
              },
            ],
          },
        ],
      };
      return interaction.reply({
        components: [nonLieContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    if (serveur === "permission") {
      const permissionContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Permission Refusée",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: "Tu n'as pas la permission d'effectuer cette commande !",
          },
        ],
      };
      return interaction.reply({
        components: [permissionContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    if (!config.liste_serveur.includes(serveur)) {
      const unknownServerContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Serveur Inconnu",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Le serveur **${serveur}** n'est pas un serveur reconnu. Veuillez fournir un serveur valide.`,
          },
        ],
      };
      return interaction.reply({
        components: [unknownServerContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    const response = await fetch(
      config.glorystaff_url + "/api/get-staff?discordId=" + interaction.user.id
    );
    const servers = await response.json();
    if (!servers.includes(serveur)) {
      const capitalizedServeur =
        serveur.charAt(0).toUpperCase() + serveur.slice(1);
      const emojiId = config.emoji[serveur.toLowerCase()];
      const permissionContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Permission Refusée",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Tu n'as pas la permission d'effectuer cette commande pour le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
          },
        ],
      };
      return interaction.reply({
        components: [permissionContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    const grade = interaction.options.getString("grade");
    const membre = interaction.options.getUser("joueur");
    const utilisateur = interaction.guild.members.cache.get(membre.id);

    const gradeConfig = await getServerDatas(interaction, serveur);

    const [panelId, gradeId] = grade.split("_");

    const panel = gradeConfig.panels.find(
      (p) => String(p.id) === String(panelId)
    );

    if (!panel) {
      const capitalizedServeur =
        serveur.charAt(0).toUpperCase() + serveur.slice(1);
      const emojiId = config.emoji[serveur.toLowerCase()];
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Rôle-Play Introuvable",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Le rôle-play "${panelId}" n'a pas été trouvé sur le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
          },
        ],
      };
      return interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    const gradeChoisi = panel.grade.find(
      (g) => String(g.gradeId) === String(gradeId)
    );

    if (!gradeChoisi) {
      const capitalizedServeur =
        serveur.charAt(0).toUpperCase() + serveur.slice(1);
      const emojiId = config.emoji[serveur.toLowerCase()];
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## :no_entry_sign: Grade Introuvable",
          },
          {
            type: 14,
            spacing: SeparatorSpacingSize.Large,
          },
          {
            type: 10,
            content: `Le grade "${gradeId}" n'a pas été trouvé sur le serveur <:NG${capitalizedServeur}:${emojiId}> **${capitalizedServeur}** !`,
          },
        ],
      };
      return interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    const rolesGrade = gradeChoisi.role || [];
    const tousLesRoles = panel.grade.flatMap((g) => g.roles || []);
    const rolesEnlever = tousLesRoles.filter((r) => !rolesGrade.includes(r));

    let pseudonym;
    try {
      const response = await fetch(
        `${config.glorybot_url}/api/get-ng?discordId=${membre.id}`
      );
      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
      const data = await response.json();

      pseudonym = data.pseudo || null;
    } catch (e) {
      pseudonym = null;
    }

    let replyInteraction;
    if (pseudonym) {
      await interaction.deferReply();
      replyInteraction = interaction;
    } else {
      const modal = {
        custom_id: `rankModal_${membre.id}`,
        title: "Choisissez le pseudonyme de la personne",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "pseudonymInput",
                label: `Pseudonyme de ${utilisateur.displayName}`,
                style: 1,
                min_length: 3,
                max_length: 32,
                placeholder: "Ex: ToStam",
                required: true,
              },
            ],
          },
        ],
      };

      await interaction.showModal(modal);

      const filter = (i) =>
        i.customId === "rankModal_" + membre.id &&
        i.user.id === interaction.user.id;

      try {
        const submitted = await interaction.awaitModalSubmit({
          filter,
          time: 120000,
        });

        pseudonym = submitted.fields.getTextInputValue("pseudonymInput").trim();

        const response = await fetch(`${config.glorybot_url}/api/ng-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discord_id: membre.id,
            pseudo_ng: pseudonym,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (
            typeof data.error === "string" &&
            data.error.startsWith(
              "L'utilisateur que vous recherchez n'existe pas"
            )
          ) {
            const errorContainer = {
              type: 17,
              accent_color: config.colors.error,
              components: [
                {
                  type: 10,
                  content: "## :no_entry_sign: Liaison échouée",
                },
                {
                  type: 14,
                  spacing: SeparatorSpacingSize.Large,
                },
                {
                  type: 10,
                  content: data.error,
                },
              ],
            };

            return interaction.reply({
              components: [errorContainer],
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              allowedMentions: { parse: [] },
            });
          }
        }

        await submitted.deferReply();
        replyInteraction = submitted;
      } catch (e) {
        console.log("Modal non soumis ou erreur :", e);
        return interaction.followUp({
          content:
            "Vous n'avez pas renseigné de pseudonyme ou le délai est écoulé. La commande a été annulée.",
          ephemeral: true,
        });
      }
    }

    const subtitle = "Quitte l'équipe des " + gradeChoisi.nom + "s";
    const badgeText = serveur.charAt(0).toUpperCase() + serveur.slice(1);
    let iconPath;
    if (["alpha", "sigma", "omega", "delta", "epsilon"].includes(serveur)) {
      iconPath = path.join(__dirname, "../../../data/icon-bedrock.png");
    } else {
      iconPath = path.join(__dirname, "../../../data/icon-java.png");
    }
    const avatarUrl = `https://skins.nationsglory.fr/body/${pseudonym}/3d/4?vr=-20&hr=10&hrh=20&vrla=50&vrra=-10&vrll=-10&vrrl=20&ratio=12&format=png&displayHair=true&headOnly=false&layers=false`;

    const W = 1920;
    const H = 1080;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#eeeff3";
    ctx.fillRect(0, 0, W, H);

    const hexWidth = 600;
    const hexHeight = 665;
    const hexX = (W * 0.45 - hexWidth) / 2;
    const hexY = (H - hexHeight) / 2;
    const hexCornerRadius = 50;

    ctx.fillStyle = gradeChoisi.couleur;
    drawRoundedHexagonPath(
      ctx,
      hexX,
      hexY,
      hexWidth,
      hexHeight,
      hexCornerRadius
    );
    ctx.fill();

    ctx.save();
    const points = [
      { x: hexX + hexWidth / 2, y: hexY },
      { x: hexX + hexWidth, y: hexY + hexHeight / 4 },
      { x: hexX + hexWidth, y: hexY + (hexHeight * 3) / 4 },
      { x: hexX + hexWidth / 2, y: hexY + hexHeight },
      { x: hexX, y: hexY + (hexHeight * 3) / 4 },
      { x: hexX, y: hexY + hexHeight / 4 },
    ];

    const topPadding = 120;
    ctx.beginPath();
    ctx.moveTo(points[1].x, points[0].y - topPadding);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.arcTo(
      points[2].x,
      points[2].y,
      points[3].x,
      points[3].y,
      hexCornerRadius
    );
    ctx.arcTo(
      points[3].x,
      points[3].y,
      points[4].x,
      points[4].y,
      hexCornerRadius
    );
    ctx.arcTo(
      points[4].x,
      points[4].y,
      points[5].x,
      points[5].y,
      hexCornerRadius
    );
    ctx.lineTo(points[5].x, points[0].y - topPadding);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(avatarUrl);
    const imgH = 882;
    const ratio = avatar.width / avatar.height;
    const imgW = imgH * ratio;
    ctx.drawImage(
      avatar,
      hexX + hexWidth / 2 - imgW / 2,
      hexY + hexHeight - imgH + 100,
      imgW,
      imgH
    );
    ctx.restore();

    const textStartX = W * 0.45 + 10;
    const hexCenterY = hexY + hexHeight / 2;

    const badgeWidth = 223;
    const badgeHeight = 69;
    const badgeRadius = 12;
    const spacing = 24;

    ctx.font = "bold 128px Arial";
    const pseudoHeight = 128;
    const pseudoY = hexCenterY;
    const badgeY = pseudoY - pseudoHeight / 2 - spacing - badgeHeight;
    const badgeX = textStartX;

    const badgeColor = config.couleur[serveur] || 0x7b70ff;
    ctx.fillStyle = `#${badgeColor.toString(16).padStart(6, "0")}`;
    ctx.beginPath();
    ctx.moveTo(badgeX + badgeRadius, badgeY);
    ctx.lineTo(badgeX + badgeWidth - badgeRadius, badgeY);
    ctx.quadraticCurveTo(
      badgeX + badgeWidth,
      badgeY,
      badgeX + badgeWidth,
      badgeY + badgeRadius
    );
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - badgeRadius);
    ctx.quadraticCurveTo(
      badgeX + badgeWidth,
      badgeY + badgeHeight,
      badgeX + badgeWidth - badgeRadius,
      badgeY + badgeHeight
    );
    ctx.lineTo(badgeX + badgeRadius, badgeY + badgeHeight);
    ctx.quadraticCurveTo(
      badgeX,
      badgeY + badgeHeight,
      badgeX,
      badgeY + badgeHeight - badgeRadius
    );
    ctx.lineTo(badgeX, badgeY + badgeRadius);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeRadius, badgeY);
    ctx.closePath();
    ctx.fill();

    const icon = await loadImage(iconPath);
    const iconHeight = icon.height;
    const iconY = badgeY + (badgeHeight - iconHeight) / 2;

    ctx.font = "32px Arial";
    const textWidth = ctx.measureText(badgeText).width;
    const spaceBetween = 16;
    const totalWidth = icon.width + spaceBetween + textWidth;
    const startX = badgeX + (badgeWidth - totalWidth) / 2;
    const iconX = startX;
    const textX = iconX + icon.width + spaceBetween;

    const contrastColor = getContrastTextColor(badgeColor);

    const tmpCanvas = createCanvas(icon.width, icon.height);
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(icon, 0, 0);
    tmpCtx.globalCompositeOperation = "source-in";
    tmpCtx.fillStyle = contrastColor;
    tmpCtx.fillRect(0, 0, icon.width, icon.height);

    ctx.drawImage(tmpCanvas, iconX, iconY, icon.width, icon.height);

    ctx.fillStyle = contrastColor;
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, textX, badgeY + badgeHeight / 2);

    const maxPseudoWidth = 1000;
    let fontSize = 128;

    ctx.font = `bold ${fontSize}px Arial`;

    while (ctx.measureText(pseudonym).width > maxPseudoWidth && fontSize > 40) {
      fontSize -= 4;
      ctx.font = `bold ${fontSize}px Arial`;
    }

    ctx.fillStyle = "#3b3e46";
    ctx.fillText(pseudonym, textStartX, pseudoY);

    ctx.fillStyle = "#8f939b";
    ctx.font = "48px Arial";
    const subtitleHeight = 48;
    const subtitleY = pseudoY + pseudoHeight / 2 + spacing + subtitleHeight / 2;
    ctx.fillStyle = "#8f939b";
    ctx.font = "48px Arial";
    const subtitleMaxWidth = 1000;
    const subtitleLineHeight = 60;
    drawWrappedText(
      ctx,
      subtitle,
      textStartX,
      subtitleY,
      subtitleMaxWidth,
      subtitleLineHeight
    );

    const buffer = await canvas.toBuffer("image/png");

    let historique = "";

    if (Array.isArray(gradeConfig.historique)) {
      historique = gradeConfig.historique
        .filter(
          (entry) => entry.pseudo?.toLowerCase() === pseudonym.toLowerCase()
        )
        .map((entry) => {
          const date = new Date(entry.date * 1000).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          return `${entry.type === "up" ? "<:up:1421602529720008824>" : "<:down:1421602527295832290>"} **${entry.grade} ${
            entry.panel ? `(${entry.panel})` : ""
          }** : ${date}`;
        })
        .join("\n");
    } else {
      gradeConfig.historique = [];
    }

    const newEntryObj = {
      pseudo: pseudonym,
      grade: "Joueur",
      panel: false,
      date: Math.floor(Date.now() / 1000),
      op_id: interaction.user.id,
      type: "down",
    };

    gradeConfig.historique.push(newEntryObj);

    for (const g of panel.grade) {
      if (g.gradeId && g.listeRp) {
        g.listeRp = g.listeRp.filter((id) => id !== membre.id);
      }
    }

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "data",
      "servers",
      `${serveur}.json`
    );

    try {
      fs.writeFileSync(filePath, JSON.stringify(gradeConfig, null, 2), "utf8");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'historique :", err);
    }

    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const newEntry = `<:down:1421602527295832290> **Joueur** : ${today}`;

    historique = historique ? `${historique}\n${newEntry}` : newEntry;

    const derankContainer = {
      type: 17,
      accent_color: config.couleur[serveur],
      components: [
        {
          type: 10,
          content: `## ${pseudonym} - ${gradeChoisi.nom}`,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        },
      ],
    };

    if (historique) {
      derankContainer.components.push(
        {
          type: 10,
          content: historique,
        },
        {
          type: 14,
          spacing: SeparatorSpacingSize.Large,
        }
      );
    }

    derankContainer.components.push({
      type: 12,
      items: [
        {
          media: { url: "attachment://affiche-derank.png" },
        },
      ],
    });

    replyInteraction.editReply({
      components: [derankContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
      files: [{ attachment: buffer, name: `affiche-derank.png` }],
    });

    for (const guild of interaction.client.guilds.cache.values()) {
      const member = guild.members.cache.get(membre.id);
      if (!member) continue;

      try {
        for (const roleId of rolesEnlever) {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(() => {});
          }
        }

        for (const roleId of rolesGrade) {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(() => {});
          }
        }
      } catch (err) {
        console.error(
          `Erreur lors de l'attribution ou le retrait des rôles à ${member.user.tag} sur ${guild.name} :`,
          err
        );
      }
    }

    await updateEffectif(client, serveur, gradeConfig, panelId)
  } catch (e) {
    console.log(e);
  }
};

exports.data = {
  name: "derank",
  description: "Retire un grade à un joueur",
  options: [
    {
      type: 3,
      name: "serveur",
      description: "Serveur sur lequel derank",
      autocomplete: true,
      required: true,
    },
    {
      type: 6,
      name: "joueur",
      description: "Joueur à derank",
      required: true,
    },
    {
      type: 3,
      name: "grade",
      description: "Grade à retirer",
      autocomplete: true,
      required: true,
    },
  ],
  contexts: [InteractionContextType.Guild],
  async autocomplete(client, interaction, config) {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "serveur") {
      const response = await fetch(
        config.glorystaff_url +
          "/api/get-staff?discordId=" +
          interaction.user.id
      );
      const servers = await response.json();
      const respondDatas = [];

      for (const serv of servers) {
        const servname = serv.charAt(0).toUpperCase() + serv.slice(1);
        respondDatas.push({ name: servname, value: serv });
      }

      if (servers.length === 0) {
        let pseudo;
        try {
          const response = await fetch(
            `${config.glorybot_url}/api/get-ng?discordId=${interaction.user.id}`
          );
          const data = await response.json();
          pseudo = data.pseudo || null;
        } catch (e) {
          pseudo = null;
        }
        if (!pseudo) {
          return await interaction.respond([
            {
              name: "Compte NationsGlory non lié, fait le maintenant : https://glorybot.fr",
              value: "non-lie",
            },
          ]);
        } else {
          return await interaction.respond([
            {
              name: "Vous n'êtes staff d'aucun serveur de NationsGlory.",
              value: "permission",
            },
          ]);
        }
      }

      return await interaction.respond(respondDatas);
    }

    if (focusedOption.name === "grade") {
      const serveur = interaction.options.getString("serveur");
      if (!serveur) {
        return await interaction.respond([
          { name: "Sélectionne d'abord un serveur", value: "no-server" },
        ]);
      }
      if (serveur === "non-lie") {
        return await interaction.respond([
          {
            name: "Compte NationsGlory non lié, fait le maintenant : https://glorybot.fr",
            value: "non-lie",
          },
        ]);
      }
      if (serveur === "permission") {
        return await interaction.respond([
          {
            name: "Vous n'êtes staff d'aucun serveur de NationsGlory.",
            value: "permission",
          },
        ]);
      }

      try {
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "data",
          "servers",
          `${serveur}.json`
        );
        if (!fs.existsSync(filePath)) {
          return await interaction.respond([
            { name: "Aucun fichier trouvé pour ce serveur", value: "no-file" },
          ]);
        }

        const rawData = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(rawData);

        if (!json.panels || json.panels.length === 0) {
          return await interaction.respond([
            {
              name: "Aucun grade trouvé pour ce serveur",
              value: "no-grade",
            },
          ]);
        }

        const grades = [];
        for (const panel of json.panels) {
          if (!panel.grade) continue;
          for (const grade of panel.grade) {
            grades.push({
              name: `${grade.nom} (${panel.name})`,
              value: `${panel.id}_${grade.gradeId}`,
            });
          }
        }

        if (grades.length === 0) {
          return await interaction.respond([
            { name: "Aucun grade trouvé dans les panels", value: "no-grade" },
          ]);
        }

        return await interaction.respond(grades.slice(0, 25));
      } catch (err) {
        console.log(err);
        return await interaction.respond([
          { name: "Erreur lors de la lecture des panels", value: "error" },
        ]);
      }
    }
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
