import { ClientEvents, Events, ChannelType, Routes } from 'discord.js';
import ImpostorClient from '../lib/client';

export const name = Events.GuildCreate;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
    const [guild] = args;
}