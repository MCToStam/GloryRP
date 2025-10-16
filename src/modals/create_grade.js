const fs = require('node:fs');
const path = require('node:path');
const { getServerDatas, saveServerDatas, getGuildColor } = require('../../utils/functions/datas.js');
const { MessageFlags, SeparatorSpacingSize } = require('discord.js');
const { getEditGradeContainer } = require('../../components/containers.js');
const { toTimeStamp } = require('../../utils/functions/numbersAndLetters.js');

function formatHexColor(input) {
	let color = input.toUpperCase();
	if (!color.startsWith('#')) color = '#' + color;
	if (!/^#[0-9A-F]{6}$/.test(color)) return null;
	return color;
}

exports.run = async (client, interaction, config) => {
	const nom = interaction.fields.getTextInputValue('nom');
	const tier = interaction.fields.getStringSelectValues('tier')[0];
	const couleur = formatHexColor(interaction.fields.getTextInputValue('couleur'));
	const panelId = Number(interaction.customId.split('-')[1]);

	if (!couleur) {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :no_entry: Couleur Invalide`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'La couleur doit être au format hexadecimal.',
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	const guildColor = await getGuildColor(interaction);
	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	const nameExists = panelDatas.grade.some((p) => p.nom.toLowerCase() === nom.toLowerCase());
	if (nameExists) {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :no_entry: Nom déjà Utilisé`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ce nom est déjà utilisé par un autre grade, veuillez en choisir un autre.',
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	const modifDate = await toTimeStamp(new Date());

	const basePath = path.join(__dirname, '..', '..', 'data', 'gradeBaseData.json');
	const baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'));

	if (!panelDatas.panels) panelDatas.panels = [];

	let newId = 1;
	const existingIds = panelDatas.grade.map((p) => p.gradeId);
	while (existingIds.includes(newId)) {
		newId++;
	}

	const newPanel = JSON.parse(JSON.stringify(baseData));

	newPanel.gradeId = newId;
	newPanel.nom = nom;
	newPanel.couleur = couleur;
	newPanel.tier = tier;

	panelDatas.grade.push(newPanel);

	if (!serverDatas.logs) serverDatas.logs = [];
	serverDatas.logs.push({
		user: interaction.user.id,
		timestamp: modifDate,
		panel: panelId,
		action: `Création du grade ${nom}`,
	});

	serverDatas.timestamp = modifDate;
	serverDatas.lastUser = interaction.user.id;

	await saveServerDatas(interaction, serverDatas, guildColor);

	const goodContainer = await getEditGradeContainer(client, panelId, guildColor, panelDatas, newId);

	return interaction.update({
		components: [goodContainer],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { parse: [] },
	});
};

exports.data = {
	name: 'create_grade',
};
