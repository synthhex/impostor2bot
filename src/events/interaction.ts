import { ClientEvents, Events, Interaction, MessageFlags } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
	const [interaction] = args;

	if (!interaction.isChatInputCommand()) return;
	if (interaction.user.bot) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		log(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		log(`Error executing command ${interaction.commandName}: ${error}`);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
