exports.run = async (client, interaction, config) => {
  await interaction.message.delete().catch(() => {});
};

exports.data = {
  name: "delete_cancel",
};

exports.conf = {
  type: "User",
};
