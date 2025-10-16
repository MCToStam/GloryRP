const { MessageFlags, SeparatorSpacingSize, ButtonStyle } = require('discord.js');
const { getEmojiTete } = require('../../utils/functions/emojis.js');
const { discordLink } = require('../../utils/functions/linkedUser.js');
const config = require('../../config.js');
const fs = require('node:fs');

async function sendEffectif(client, serveur, serveurDatas, panelId) {
	const panel = serveurDatas.panels.find((p) => p.id === panelId);

	let errorMsg;
	if (!panel.grade || panel.grade.length === 0) {
		errorMsg = `Le rôle-play **${panel.name}** n’a aucun grade défini.`;
	}

	let channel;
	if (panel.channels.effectif) {
		channel = client.channels.cache.get(panel.channels.effectif);
		if (!channel) {
			errorMsg = `Le salon d'effectif du rôle-play **${panel.name}** n'est pas valide.`;
		}
	} else {
		errorMsg = `Le rôle-play **${panel.name}** n’a aucune salon d'effectif défini.`;
	}

	if (errorMsg) {
		return {
			type: 17,
			accent_color: config.colors.error,
			components: [
				{ type: 10, content: '## :no_entry_sign: Erreur' },
				{ type: 14, spacing: SeparatorSpacingSize.Large },
				{ type: 10, content: errorMsg },
			],
		};
	}

	const ngData = await discordLink();

	const gradesTriees = panel.grade.sort((a, b) => Number(b.tier) - Number(a.tier));

	let effectifContent = '';

	for (const grade of gradesTriees) {
		const mentionsArray = [];

		if (grade.listeRp && grade.listeRp.length > 0) {
			for (const joueur of grade.listeRp) {
				const emojiTete = await getEmojiTete(client, ngData[joueur]);
				mentionsArray.push(`${emojiTete} <@${joueur}> ➤ ${ngData[joueur] || 'Inconnu'}`);
			}
		}

		const mentions = mentionsArray.length > 0 ? mentionsArray.join('\n') : '*Ce grade est vide*';
		effectifContent += `**${grade.nom} (${grade.listeRp ? grade.listeRp.length : 0}) :**\n${mentions}\n\n`;
	}

	const effectifContainer = {
		type: 17,
		accent_color: config.couleur[serveur],
		components: [
			{
				type: 10,
				content: `## ${panel.emoji ? `${panel.emoji} ` : ''}${panel.name}`,
			},
			{ type: 14, spacing: SeparatorSpacingSize.Large },
			{ type: 10, content: effectifContent },
		],
	};

	const buttons =
		panel.effectif.button?.map((b, i) => ({
			type: 2,
			style: ButtonStyle.Link,
			label: b.label,
			url: b.lien,
		})) || [];

	if (buttons.length > 0) {
		effectifContainer.components.push({ type: 14, spacing: SeparatorSpacingSize.Large }, { type: 1, components: buttons });
	}

	const message = await channel.send({
		components: [effectifContainer],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { parse: [] },
	});

	panel.effectif.message = message.id;
	panel.effectif.channel = message.channelId;
	panel.effectif.guild = message.guildId;
	const panelPath = `data/servers/${serveur}.json`;
	fs.writeFileSync(panelPath, JSON.stringify(serveurDatas));

	return {
		type: 17,
		accent_color: config.colors.success,
		components: [
			{ type: 10, content: '## :white_check_mark: Effectif Envoyé' },
			{ type: 14, spacing: SeparatorSpacingSize.Large },
			{
				type: 10,
				content: `L'effectif du rôle-play **${panel.name}** a correctement été envoyé ici : ${message.url}`,
			},
		],
	};
}

async function updateEffectif(client, serveur, serveurDatas, panelId) {
	const panel = serveurDatas.panels.find((p) => p.id === Number(panelId));
	if (!panel || !panel.effectif || !panel.effectif.message || !panel.effectif.channel) return;

	const channel = client.channels.cache.get(panel.effectif.channel);
	if (!channel) return;

	const ngData = await discordLink();

	const gradesTriees = panel.grade.sort((a, b) => Number(b.tier) - Number(a.tier));

	let effectifContent = '';

	for (const grade of gradesTriees) {
		const mentionsArray = [];

		if (grade.listeRp && grade.listeRp.length > 0) {
			for (const joueur of grade.listeRp) {
				const emojiTete = await getEmojiTete(client, ngData[joueur]);
				mentionsArray.push(`${emojiTete} <@${joueur}> ➤ ${ngData[joueur] || 'Inconnu'}`);
			}
		}

		const mentions = mentionsArray.length > 0 ? mentionsArray.join('\n') : '*Ce grade est vide*';
		effectifContent += `**${grade.nom} (${grade.listeRp ? grade.listeRp.length : 0}) :**\n${mentions}\n\n`;
	}

	const effectifContainer = {
		type: 17,
		accent_color: config.couleur[serveur],
		components: [
			{
				type: 10,
				content: `## ${panel.emoji ? `${panel.emoji} ` : ''}${panel.name}`,
			},
			{ type: 14, spacing: SeparatorSpacingSize.Large },
			{ type: 10, content: effectifContent },
		],
	};

	const buttons =
		panel.effectif.button?.map((b, i) => ({
			type: 2,
			style: ButtonStyle.Link,
			label: b.label,
			url: b.lien,
		})) || [];

	if (buttons.length > 0) {
		effectifContainer.components.push({ type: 14, spacing: SeparatorSpacingSize.Large }, { type: 1, components: buttons });
	}

	try {
		const message = await channel.messages.fetch(panel.effectif.message);
		if (message) {
			await message.edit({
				components: [effectifContainer],
				allowedMentions: { parse: [] },
			});
		}
	} catch (err) {}
}

module.exports = { sendEffectif, updateEffectif };
