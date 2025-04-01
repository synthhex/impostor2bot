import { ClientEvents, Events, ChannelType } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.GuildDelete;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
    const [guild] = args;

    client.sessionManager.leaveGuild(guild.id); // delete all sessions in the guild 
}