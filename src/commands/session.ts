import { ChannelType, ChatInputCommandInteraction, Interaction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import ImpostorClient from '../lib/client';

export const data = new SlashCommandBuilder()
	.setName('crew')
	.setDescription('Manage Among Us sessions.')
	.addSubcommand((subcommand) =>
		subcommand.setName('start').setDescription('Start a new session in your current channel.'),
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('stop').setDescription('Stop the current session in your current channel.'),
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('steal').setDescription("Steal ownership of your channel's session."),
	);

export const execute = async (client: ImpostorClient, interaction: ChatInputCommandInteraction) => {
	if (!interaction.isChatInputCommand()) return;
	if (
		!interaction.member ||
		!('voice' in interaction.member) ||
		interaction.member.voice.channel?.type !== ChannelType.GuildVoice
	)
		return await interaction.reply({
			content: 'You must be in a voice channel to use this command.',
			flags: MessageFlags.Ephemeral,
		});
	if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText)
		return await interaction.reply({
			content: 'You must be in a text channel to use this command.',
			flags: MessageFlags.Ephemeral,
		}); // somehow...

	if (interaction.member.user.bot) 
		return await interaction.reply({
			content: 'Bots cannot use this command.',
		});
	
	const subcommand = interaction.options.getSubcommand();
	const sessionManager = (interaction.client as ImpostorClient).sessionManager;

	switch (subcommand) {
		case 'start':
			const existingSession = sessionManager.getSession(interaction.member.voice.channel);
			if (existingSession)
				return await interaction.reply({
					content: 'A session already exists in this channel.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});

			if (interaction.member.voice.channel.members.size < 2)
				return await interaction.reply({
					content: 'You need at least 2 people in the voice channel to start a session.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});

			sessionManager.createSession(interaction.member.voice.channel, interaction.member, interaction.channel);

			await interaction.reply({
				content: 'Starting a new session...',
				files: client.safeAsset('gus.jpeg'),
			});
			break;
		case 'stop':
			const session = sessionManager.getSession(interaction.member.voice.channel);
			if (!session)
				return await interaction.reply({
					content: 'No session exists in this channel.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});
			if (!session.isOwner(interaction.member)) {
				if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
					session.destroySession();
					return await interaction.reply({
						content: 'Sure mr. discord cheeto mod, session stopped.',
						files: client.safeAsset('mult.gif'),
					});
				} else {
					return await interaction.reply({
						files: client.safeAsset('nope.gif'),
					});
				}
			} else {
				session.destroySession();
			}

			await interaction.reply({
				content: 'Stopping the current session...',
				files: client.safeAsset('thumb.png'),
			});
			break;
		case 'steal':
			const stealSession = sessionManager.getSession(interaction.member.voice.channel);
			if (!stealSession)
				return await interaction.reply({
					content: 'No session exists in this channel.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});
			if (stealSession.isOwner(interaction.member))
				return await interaction.reply({
					content: 'How you gonna steal your own session lmfao? Bobec.',
					files: client.safeAsset('bi.png'),
				});
			if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
				await stealSession.changeOwner(interaction.member);
				return await interaction.reply({
					content: 'Sure mr. discord cheeto mod, enjoy the kradena sesiq.',
					files: client.safeAsset('mult.gif'),
				});
			} else {
				return await interaction.reply({
					files: client.safeAsset('nope.gif'),
				});
			}
			break;
		case "optout":
			const optoutSession = sessionManager.getSession(interaction.member.voice.channel);
			if (!optoutSession)
				return await interaction.reply({
					content: 'No session exists in this channel.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});
			if (optoutSession.isOptedOut(interaction.member)) {
				return await interaction.reply({
					content: 'You are already opted out of the session.',
					files: client.safeAsset('thumb.png'),
				});
			} else {
				optoutSession.optOut(interaction.member);
				return await interaction.reply({
					content: 'You have opted out of the session.',
					files: client.safeAsset('thumb.png'),
				});
			}
			break;
		case "optin":
			const optinSession = sessionManager.getSession(interaction.member.voice.channel);
			if (!optinSession)
				return await interaction.reply({
					content: 'No session exists in this channel.',
					files: client.safeAsset('disintegrate.png'),
					flags: MessageFlags.Ephemeral,
				});
			if (!optinSession.isOptedOut(interaction.member)) {
				return await interaction.reply({
					content: 'You are not opted out of the session.',
					files: client.safeAsset('thumb.png'),
				});
			} else {
				optinSession.optIn(interaction.member);
				return await interaction.reply({
					content: 'You have opted in to the session.',
					files: client.safeAsset('thumb.png'),
				});
			}
			break;
		default:
			await interaction.reply({
				content: 'Unknown subcommand.',
				files: client.safeAsset('disintegrate.png'),
				flags: MessageFlags.Ephemeral,
			});
			break;
	}
};
