import { Interaction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import ImpostorClient from '../lib/client';

export const data = new SlashCommandBuilder().setName('ping').setDescription("Ping the bot to check if it's alive.");

export const execute = async (_: ImpostorClient, interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
};
