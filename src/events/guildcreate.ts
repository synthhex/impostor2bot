import { ClientEvents, Events, ChannelType, Routes } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.GuildCreate;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
    const [guild] = args;

    const commands = Array.from(client.commands.values()).map((command) =>
        command.data.toJSON(),
    );

    try {
        client.rest.put(
            Routes.applicationGuildCommands(client.user!.id, guild.id),
            { body: commands },
        )
    } catch (error) {
        log(`Error registering commands for guild ${guild.name}: ${error}`);
    }
}