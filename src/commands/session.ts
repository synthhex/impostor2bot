import { ChannelType, Interaction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import ImpostorClient from "../lib/client";

export const data = new SlashCommandBuilder()
    .setName("crew")
    .setDescription("Manage Among Us sessions.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("start")
            .setDescription("Start a new session in your current channel.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("stop")
            .setDescription("Stop the current session in your current channel.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("steal")
            .setDescription("Steal ownership of your channel's session.")
    );

export const execute = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.member || !('voice' in interaction.member) || interaction.member.voice.channel?.type !== ChannelType.GuildVoice)
        return await interaction.reply({ content: "You must be in a voice channel to use this command.", flags: MessageFlags.Ephemeral });
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText)
        return await interaction.reply({ content: "You must be in a text channel to use this command.", flags: MessageFlags.Ephemeral }); // somehow...

    const subcommand = interaction.options.getSubcommand();
    const sessionManager = (interaction.client as ImpostorClient).sessionManager;


    const client = interaction.client;

    switch (subcommand) {
        case "start":
            const existingSession = sessionManager.getSession(interaction.member.voice.channel);
            if (existingSession)
                return await interaction.reply({ 
                    content: "A session already exists in this channel.", 
                    files: client.safeAsset('disintegrate.png'), 
                    flags: MessageFlags.Ephemeral 
                });

            if (interaction.member.voice.channel.members.size < 2)
                return await interaction.reply({ 
                    content: "You need at least 2 people in the voice channel to start a session.", 
                    files: client.safeAsset('disintegrate.png'),
                    flags: MessageFlags.Ephemeral
                });
            
            sessionManager.createSession(interaction.member.voice.channel, interaction.member, interaction.channel);
            
            await interaction.reply({ 
                content: "Starting a new session...",
                files: client.safeAsset('gus.jpeg')
            });
            break;
        case "stop":
            const session = sessionManager.getSession(interaction.member.voice.channel);
            if (!session)
                return await interaction.reply({ 
                    content: "No session exists in this channel.", 
                    files: client.safeAsset('disintegrate.png'), 
                    flags: MessageFlags.Ephemeral 
                });
            if (session.user.id !== interaction.user.id) {
                if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    sessionManager.deleteSession(interaction.member.voice.channel);
                    return await interaction.reply({ 
                        content: "Sure mr. discord cheeto mod, session stopped.", 
                        files: client.safeAsset('mult.gif') 
                    });
                } else {
                    return await interaction.reply({ 
                        files: client.safeAsset('nope.gif') 
                    });
                }
            }

            sessionManager.deleteSession(interaction.member.voice.channel);
            await interaction.reply({ 
                content: "Stopping the current session...",
                files: client.safeAsset('thumb.png')
            });
            break;
        case "steal":
            const stealSession = sessionManager.getSession(interaction.member.voice.channel);
            if (!stealSession)
                return await interaction.reply({ 
                    content: "No session exists in this channel.",
                    files: client.safeAsset('disintegrate.png'),
                    flags: MessageFlags.Ephemeral 
                });
            if (stealSession.user.id === interaction.user.id)
                return await interaction.reply({ 
                    content: "How you gonna steal your own session lmfao? Bobec.",
                    files: client.safeAsset('bi.png'),
                });
            if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                interaction.member.voice.setMute(false, 'Stolen session.');
                stealSession.user.voice.setMute(true, 'Stolen session.');
                stealSession.changeOwner(interaction.member);
                return await interaction.reply({ 
                    content: "Sure mr. discord cheeto mod, enjoy the kradena sesiq.", 
                    files: client.safeAsset('mult.gif') 
                });
            } else {
                return await interaction.reply({ 
                    files: client.safeAsset('nope.gif') 
                });
            }
            break;
        default:
            await interaction.reply({ 
                content: "Unknown subcommand.", 
                files: client.safeAsset('disintegrate.png'),
                flags: MessageFlags.Ephemeral 
            });
            break;
    }
}