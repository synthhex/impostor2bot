import { Events } from 'discord.js';
import { log } from '../utils/logger';
import ImpostorClient from '../lib/client';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client: ImpostorClient) {
	1;
	if (!client.user) throw new Error('Client user is not defined. Not good.');
	log(`Logged in as ${client.user.tag}`);
}
