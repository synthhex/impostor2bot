import { ClientEvents, Events } from 'discord.js';
import ImpostorClient from '../lib/client';
import Logger from '../utils/logger';

export const name = Events.ClientReady;
export const once = true;
export async function execute(_: ImpostorClient, ...args: ClientEvents[typeof name]) {
	const [client] = args;

	if (!client.user) throw new Error('Client user is not defined. Not good.');
	Logger.log(`Logged in as ${client.user.tag}`);
}
