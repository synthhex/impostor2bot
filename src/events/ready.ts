import { ClientEvents, Events } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.ClientReady;
export const once = true;
export async function execute(_: ImpostorClient, ...args: ClientEvents[typeof name]) {
	const [client] = args;

	if (!client.user) throw new Error('Client user is not defined. Not good.');
	log(`Logged in as ${client.user.tag}`);
}
