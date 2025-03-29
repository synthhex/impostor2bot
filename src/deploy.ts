import { REST, Routes } from 'discord.js';
import ImpostorClient from './lib/client';
import { tryReadEnv } from './utils/env';
import { log } from './utils/logger';

async function main() {
	const commands = Array.from((await ImpostorClient.collectCommands()).values()).map((command) =>
		command.data.toJSON(),
	);

	const rest = new REST().setToken(tryReadEnv('DISCORD_TOKEN', String));

	// Load program arguments
	const guildId = process.argv.slice(2).includes('--all') ? 'A' : (process.env.TEST_GUILD_ID ?? null);

	if (!guildId) {
		log(
			'No TEST_GUILD_ID environmental variable set. If you want to refresh all guilds, run this script with the --all flag.',
		);
		return;
	} else {
		log(guildId === 'A' ? `Using all guilds.` : `Using guild ID: ${guildId}`);
	}

	try {
		log(`Started refreshing/uploading ${commands.length} slash commands.`);

		const data = await rest.put(
			guildId === 'A'
				? Routes.applicationCommands(tryReadEnv('CLIENT_ID', String))
				: Routes.applicationGuildCommands(tryReadEnv('CLIENT_ID', String), guildId),
			{ body: commands },
		);

		log(`Successfully refreshed/uploaded ${(data as []).length} slash commands.`);
	} catch (error) {
		throw new Error(`Error uploading commands: ${error}`);
	}
}

main().catch((err) => {
	console.error('Could not deploy commands. Error in main function:', err);
	process.exit(1);
});
