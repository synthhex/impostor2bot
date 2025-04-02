import { config } from 'dotenv';
config({ path: 'secrets.env' });

import { GatewayIntentBits, MessageManager, Options } from 'discord.js';
import ImpostorClient from './lib/client';
import clientSettings from './config';
import { tryReadEnv } from './utils/env';

Error.stackTraceLimit = 10000;

async function main() {
	const client = new ImpostorClient(clientSettings);

	await client.loadAssets();
	await client.loadCommands();
	await client.loadEvents();

	await client.login(tryReadEnv('DISCORD_TOKEN', String));
}

main().catch((err) => {
	console.error('Error in main function:', err);
	// process.exit(1);
});

process.on('uncaughtException', (err) => {
	console.trace('Uncaught Exception:', err);
});
