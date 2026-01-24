const {
  errorStaffContainer,
  discordStaff,
} = require("../../../utils/functions/linkedUser");
const { MessageFlags } = require("discord.js");

exports.run = async (client, interaction, config) => {
  const serveur = interaction.values[0].split("-")[1];
  const parts = interaction.customId.split("-");

  const commandName = parts[1].replace(/_/g, "-");
  const argsSansServeur = parts.slice(2).map((part) => {
    const [name, value] = part.split("=");
    return { name, value };
  });

  interaction.parametre = Object.fromEntries(
    argsSansServeur.map((arg) => [arg.name, arg.value]),
  );

  const commandFile = require(`../../../src/commands/slash/${commandName}.js`);
  const permission = commandFile?.config?.permission;

  const errorContainer = await errorStaffContainer(serveur);

  if (errorContainer) {
    return interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  if (permission) {
    const { container } = await discordStaff(
      interaction.user.id,
      serveur,
      permission,
    );

    if (container) {
      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }

  interaction.parametre.serveur = serveur;

  await commandFile.proxy(client, interaction, config);
};

exports.data = {
  name: "selectServeur",
};
