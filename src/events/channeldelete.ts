import { ClientEvents, Events, ChannelType } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.ChannelDelete;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
    const [channel] = args;

    if (channel.type !== ChannelType.GuildVoice) return; // ignore channels that aren't normal voice channels

    const session = client.sessionManager.getSession(channel);
    if (!session) return;

    client.sessionManager.deleteSession(channel); // remove the session from the manager
}