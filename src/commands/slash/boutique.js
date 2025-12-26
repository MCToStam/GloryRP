const { getServerDatas } = require("../../../utils/functions/datas");
const { getBoutiqueContainer } = require("../../../components/boutique");
const { discordLink } = require("../../../utils/functions/linkedUser");
const {
  getServerCommand,
} = require("../../../utils/functions/getServerCommand");

exports.run = async (client, interaction, config) => {
  const serv =
    interaction.options.getString("serveur")?.toLowerCase() ||
    (await getServerCommand(interaction.guild.id));

  if (!serv) {
    const nonServeurContainer = {
      type: 17,
      accent_color: config.colors.error,
      components: [
        {
          type: 10,
          content: "## :no_entry_sign: Aucun Serveur",
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 10,
          content:
            "Aucun serveur par défaut n'a été trouvé sur ce serveur Discord, veuillez en spécifier un manuellement.",
        },
      ],
    };
    return interaction.reply({
      components: [nonServeurContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const pseudonym = await discordLink(interaction.user.id);
  if (!pseudonym) {
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
          spacing: 2,
        },
        {
          type: 10,
          content:
            'Votre compte Discord n\'est pas reconnu, il vous faut être renseigné pour utiliser cette commande. Pour ce faire, il te suffit de te connecter à notre panel de contrôle. Une fois connecté avec ton compte Discord, va dans la partie "Profil" puis tu as un bouton afin de lier ton compte NationsGlory.',
        },
        {
          type: 14,
          spacing: 2,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              url: "https://glorybot.fr/user/profile",
              label: "🔗 Lier son Compte",
              style: 5,
            },
          ],
        },
      ],
    };
    return interaction.reply({
      components: [nonLieContainer],
      flags: 32768 | 64,
      allowedMentions: { parse: [] },
    });
  }

  const serverDatas = await getServerDatas(interaction, serv);
  const configContainer = await getBoutiqueContainer(
    serv,
    serverDatas.boutiques,
  );
  return interaction.reply({
    components: [configContainer],
    flags: 32768,
    allowedMentions: { parse: [] },
  });
};

exports.data = {
  name: "boutique",
  description: "Affiche la boutique de ton serveur",
  options: [
    {
      type: 3,
      name: "serveur",
      description: "Serveur pour lequel afficher la boutique",
      autocomplete: true,
      required: false,
    },
  ],
  contexts: [0],
  async autocomplete(client, interaction, config) {
    const pseudonym = await discordLink(interaction.user.id);

    if (!pseudonym) {
      return interaction.respond([
        {
          name: "Compte NationsGlory non lié, fais-le maintenant : https://glorybot.fr",
          value: "non-lie",
        },
      ]);
    }

    const servers = [];
    const focusedValue = interaction.options.getFocused()?.toLowerCase() ?? "";
    for (const serveur of config.liste_serveur) {
      if (!serveur.toLowerCase().startsWith(focusedValue)) continue;
      const serverDatas = await getServerDatas(interaction, serveur);
      if (serverDatas?.boutiques?.length > 0) servers.push(serveur);
    }

    const filtered = servers
      .filter((serv) => serv.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map((serv) => ({
        name: serv.charAt(0).toUpperCase() + serv.slice(1),
        value: serv,
      }));

    await interaction.respond(filtered);
  },
};

exports.conf = {
  cooldown: 5,
  enabled: true,
  category: "⚙ Configuration",
};
