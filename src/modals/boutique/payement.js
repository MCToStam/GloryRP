const {
  getServerDatas,
  saveServerDatas,
  getGuildColor,
} = require("../../../utils/functions/datas.js");
const {
  getBoutiquePayementContainer,
} = require("../../../components/containers");
const { getEmojiTete } = require("../../../utils/functions/emojis");

exports.run = async (client, interaction, config) => {
  const boutiqueId = Number(interaction.customId.split("-")[1]);
  const action = interaction.customId.split("-")[2];

  const guildColor = await getGuildColor(interaction);
  const serverDatas = await getServerDatas(interaction, guildColor);
  const boutiqueDatas = serverDatas.boutiques.find((x) => x.id === boutiqueId);

  if (action === "commande") {
    let commande = interaction.fields.getTextInputValue("commande").trim();

    commande = commande.replace(/\//g, "");

    if (!commande || commande.includes(" ")) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: "## ❌ Commande Invalide",
          },
          { type: 14, spacing: 2 },
          {
            type: 10,
            content:
              "La commande doit contenir un seul mot et ne pas contenir d'espaces.",
          },
        ],
      };

      return await interaction.reply({
        components: [errorContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
    }

    boutiqueDatas.payement.commande = commande;

    await saveServerDatas(interaction, serverDatas, guildColor);

    const container = await getBoutiquePayementContainer(
      boutiqueId,
      guildColor,
      boutiqueDatas,
    );

    return await interaction.update({
      components: [container],
      flags: 32768,
      allowedMentions: { parse: [] },
    });
  } else if (action === "donnee") {
    const type = interaction.fields.getStringSelectValues("type")[0];
    let pseudo = interaction.fields.getTextInputValue("pseudo");
    const argent = Number(interaction.fields.getTextInputValue("argent"));

    const searchRes = await fetch(
      `https://apiv2.nationsglory.fr/forums/userSearch?search=${pseudo}`,
    );
    const similarUsers = await searchRes.json();

    const foundUser = similarUsers.find(
      (user) => user.username.toLowerCase() === pseudo.toLowerCase(),
    );

    if (!foundUser) {
      const suggestions = similarUsers
        .map((user) => `- ${user.username.replace(/_/g, "\\_")}`)
        .join("\n");

      const description =
        similarUsers.length === 0
          ? "L'utilisateur que vous recherchez n'existe pas."
          : `L'utilisateur que vous recherchez n'existe pas, il s'agit peut-être de :\n${suggestions}`;

      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## ❌ Pseudonyme Invalide`,
          },
          { type: 14, spacing: 2 },
          {
            type: 10,
            content: description,
          },
        ],
      };

      return await interaction.reply({
        components: [errorContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
    }

    pseudo = foundUser.username;

    if (!argent) {
      const errorContainer = {
        type: 17,
        accent_color: config.colors.error,
        components: [
          {
            type: 10,
            content: `## ❌ Argent Invalide`,
          },
          { type: 14, spacing: 2 },
          {
            type: 10,
            content: "L'argent doit être un nombre valide.",
          },
        ],
      };

      return await interaction.reply({
        components: [errorContainer],
        flags: 32768 | 64,
        allowedMentions: { parse: [] },
      });
    }

    if (!boutiqueDatas.payement.donnee[pseudo])
      boutiqueDatas.payement.donnee[pseudo] = 0;
    if (type === "add") boutiqueDatas.payement.donnee[pseudo] += argent;
    if (type === "remove") boutiqueDatas.payement.donnee[pseudo] -= argent;
    if (type === "set") boutiqueDatas.payement.donnee[pseudo] = argent;

    await saveServerDatas(interaction, serverDatas, guildColor);

    const goodContainer = {
      type: 17,
      accent_color: config.colors.success,
      components: [
        {
          type: 10,
          content: "## ✅ Argent Modifié",
        },
        { type: 14, spacing: 2 },
        {
          type: 10,
          content: `${await getEmojiTete(
            client,
            pseudo,
          )} ${pseudo} a maintenant ${boutiqueDatas.payement.donnee[
            pseudo
          ].toLocaleString()}$.`,
        },
      ],
    };

    return await interaction.reply({
      components: [goodContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }
};

exports.data = {
  name: "boutique_payement",
};
