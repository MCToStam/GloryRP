const { getServerDatas, saveServerDatas, getGuildColor } = require('../../utils/functions/datas.js');
const { discordLink } = require('../../utils/functions/linkedUser.js');
const { MessageFlags, SeparatorSpacingSize, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

exports.run = async (client, interaction, config) => {
	const pseudonym = await discordLink(interaction.user.id);
	if (!pseudonym) {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Compte non Lié`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ton compte Discord doit être lié à ton compte NationsGlory pour effectuer cette action.',
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
							url: 'https://glorybot.fr/user/profile',
							label: '🔗 Lier son Compte',
							style: ButtonStyle.Link,
						},
					],
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	const panelId = Number(interaction.customId.split('-')[1]);
	const taskId = Number(interaction.customId.split('-')[2]);

	const serverDatas = await getServerDatas(interaction);
	const panelDatas = serverDatas.panels.find((x) => x.id === panelId);

	const panelIndex = panelDatas.tasks.findIndex((x) => x.taskId === taskId);
	if (panelIndex === -1) {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Tâche Introuvable`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: "Cette tâche n'existe pas ou a été supprimée.",
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}
	const tache = panelDatas.tasks.find((t) => t.taskId === taskId);

	if (!panelDatas.channels.logs && tache.type === '3') {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Rôle-Play mal Configuré`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ce rôle-play est mal configuré, en effet, aucun salon de type "logs" n\'a été définit.',
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	if (!panelDatas.channels.responsable && tache.type !== '3') {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Rôle-Play mal Configuré`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ce rôle-play est mal configuré, en effet, aucun salon de type "responsable" n\'a été définit.',
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	const logsChannel = panelDatas.channels.logs ? interaction.guild.channels.cache.get(panelDatas.channels.logs) : null;
	const respChannel = panelDatas.channels.responsable ? interaction.guild.channels.cache.get(panelDatas.channels.responsable) : null;

	if (!logsChannel && tache.type === '3') {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Rôle-Play mal Configuré`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ce rôle-play est mal configuré, en effet, le salon "logs" est invalide.',
				},
			],
		};

		return await interaction.reply({
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
	}

	if (!respChannel && tache.type !== '3') {
		const errorContainer = {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{
					type: 10,
					content: `## :x: Rôle-Play mal Configuré`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: 'Ce rôle-play est mal configuré, en effet, le salon "responsable" est invalide.',
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
	const details = interaction.fields.getTextInputValue('details');

	let foundUrl = null;
	let foundTitre = null;

	if (tache.type !== '1') {
		try {
			const response = await fetch(tache.url);
			if (!response.ok) throw new Error(`Erreur de requête ${response.status}`);

			const html = await response.text();
			const $ = cheerio.load(html);

			let found = false;
			const detailsLower = details.toLowerCase();

			$('a.stretched-link[title]').each((i, el) => {
				const titre = $(el).attr('title')?.trim();
				const href = $(el).attr('href')?.trim();
				if (!titre || !href) return;

				const titreLower = titre.toLowerCase();
				const hrefLower = href.toLowerCase();

				if (titreLower.includes(detailsLower) || detailsLower.includes(hrefLower)) {
					found = true;
					foundUrl = `https://nationsglory.fr${href}`;
					foundTitre = titre;
				}
			});

			if (!found) {
				const errorContainer = {
					type: 17,
					accent_color: config.colors.error,
					components: [
						{
							type: 10,
							content: `## :x: Discussion Introuvable`,
						},
						{
							type: 14,
							spacing: SeparatorSpacingSize.Large,
						},
						{
							type: 10,
							content: `Aucune discussion correspondant à "${details}" n’a été trouvée sur le [forum](${tache.url}).`,
						},
					],
				};

				return await interaction.reply({
					components: [errorContainer],
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					allowedMentions: { parse: [] },
				});
			}
		} catch (err) {
			console.error(err);
			const errorContainer = {
				type: 17,
				accent_color: config.colors.error,
				components: [
					{
						type: 10,
						content: `## :x: Erreur lors de la Vérification`,
					},
					{
						type: 14,
						spacing: SeparatorSpacingSize.Large,
					},
					{
						type: 10,
						content: `Impossible de vérifier la discussion sur le forum.\n\`\`\`${err.message}\`\`\``,
					},
				],
			};

			return await interaction.reply({
				components: [errorContainer],
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			});
		}
	}

	const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
	const today = jours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

	const salaireToday = tache.salaire[today] ?? 0;

	let message;

	if (tache.type !== '3') {
		const tacheContainer = {
			type: 17,
			accent_color: config.couleur[guildColor],
			components: [
				{
					type: 10,
					content: `## ${tache.emoji ? `${tache.emoji} ` : ''}${tache.name}`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: `Tâche demandée par <@${interaction.user.id}> :\n> Détails : ${
						foundTitre ? foundTitre : details
					}\n> Salaire à Attribué : ${salaireToday}$`,
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
							custom_id: `task_accepter-${panelId}-${taskId}-${interaction.user.id}`,
							label: '✅ Accepter la Tâche',
							style: ButtonStyle.Success,
						},
						{
							type: 2,
							custom_id: `task_accepter_custom-${panelId}-${taskId}-${interaction.user.id}`,
							label: '✅ Accepter la Tâche avec un Salaire Customisé',
							style: ButtonStyle.Secondary,
						},
					],
				},
				{
					type: 1,
					components: [
						{
							type: 2,
							custom_id: `task_refuser-${panelId}-${taskId}-${interaction.user.id}`,
							label: '❌ Refuser la Tâche',
							style: ButtonStyle.Danger,
						},
						...(foundUrl ?
							[
								{
									type: 2,
									label: '🔗 Lien vers la Tâche',
									url: foundUrl,
									style: ButtonStyle.Link,
								},
							]
						:	[]),
					],
				},
			],
		};

		message = await respChannel.send({
			components: [tacheContainer],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] },
		});
	} else {
		const tacheContainer = {
			type: 17,
			accent_color: config.colors.success,
			components: [
				{
					type: 10,
					content: `## ${tache.emoji ? `${tache.emoji} ` : ''}${tache.name}`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 10,
					content: `Tâche demandée par <@${interaction.user.id}> :\n> Détails : ${
						foundTitre ? foundTitre : details
					}\n> Salaire Attribué : ${salaireToday}$\n> Acceptée automatiquement`,
				},
				{
					type: 14,
					spacing: SeparatorSpacingSize.Large,
				},
				{
					type: 1,
					components: [
						...(foundUrl ?
							[
								{
									type: 2,
									label: '🔗 Lien vers la Tâche',
									url: foundUrl,
									style: ButtonStyle.Link,
								},
							]
						:	[]),
					],
				},
			],
		};

		message = await logsChannel.send({
			components: [tacheContainer],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] },
		});
	}

	const now = new Date();
	const mois = String(now.getMonth() + 1).padStart(2, '0');
	const annee = String(now.getFullYear());
	const key = `${mois}_${annee}`;

	if (!panelDatas.salaire.salaire[pseudonym]) panelDatas.salaire.salaire[pseudonym] = {};
	if (!panelDatas.salaire.salaire[pseudonym][key]) panelDatas.salaire.salaire[pseudonym][key] = { taches: [] };

	panelDatas.salaire.salaire[pseudonym][key].taches.push({
		nom: tache.name,
		emoji: tache.emoji,
		lien: foundUrl ?? false,
		details: foundTitre ?? details,
		timestamp: Date.now(),
		status: tache.type === '3' ? 'accepted' : 'waiting',
		staff: tache.type === '3' ? 'automatique' : false,
		argent: salaireToday,
		messageId: message.id,
	});

	await saveServerDatas(interaction, serverDatas, guildColor);

	const goodContainer = {
		type: 17,
		accent_color: config.colors.success,
		components: [
			{
				type: 10,
				content: `## :white_check_mark: Tâche Envoyée`,
			},
			{
				type: 14,
				spacing: SeparatorSpacingSize.Large,
			},
			{
				type: 10,
				content: `La tâche a correctement été ${tache.type === '3' ? 'validée.' : 'envoyée au(x) responsable(s).'}`,
			},
		],
	};

	return await interaction.reply({
		components: [goodContainer],
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		allowedMentions: { parse: [] },
	});
};

exports.data = { name: 'panel_tasks' };
