import {
	ApplicationCommand,
	AttachmentBuilder,
	Client,
	ClientOptions,
	Collection,
	Guild,
	GuildMember,
	SlashCommandBuilder,
} from 'discord.js';
import Command, { CommandBlueprint } from './command';
import { readdirSync } from 'fs';
import Event from './event';
import path from 'path';
import Logger from '../utils/logger';
import SessionManager from './manager';

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
		sessionManager: SessionManager;
		assets: Collection<string, AttachmentBuilder>;
		shouldBeFreed(user: GuildMember): boolean;
		free(user: GuildMember): void;
		safeAsset(name: string): [AttachmentBuilder] | [];
		loadAssets(): Promise<void>;
		loadCommands(): Promise<void>;
		loadEvents(): Promise<void>;
	}
}

export default class ImpostorClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public sessionManager: SessionManager = new SessionManager(this);

	public assets: Collection<string, AttachmentBuilder> = new Collection();

	constructor(config: ClientOptions) { super(config); }

	/**
	 * Get an asset safely in a format that can be passed directly to discord.js.
	 * @param name The name of the asset to get.
	 * @returns An single-element tuple with an AttachmentBuilder object, or an empty array if the asset was not found.
	 */
	public safeAsset(name: string): [AttachmentBuilder] | [] {
		const asset = this.assets.get(name);
		if (!asset) {
			Logger.warn(`Asset ${name} not found!`);
			return [];
		}
		return [asset];
	}

	/** Load assets from the assets directory. */
	public async loadAssets(): Promise<void> {
		const assets = ['nope.gif', 'bi.png', 'mult.gif', 'thumb.png', 'disintegrate.png', 'gus.jpeg'];
		const assetsPath = path.join(__dirname, '../../assets');
		const assetCollection = new Collection<string, AttachmentBuilder>();

		for (const file of assets) {
			const filePath = path.join(assetsPath, file);
			Logger.log(`Loading asset file: ${filePath}`);
			if (!filePath.startsWith(assetsPath))
				throw new Error(`Attempted to load file outside assets directory: ${filePath}`);
			const attachment = new AttachmentBuilder(filePath);
			assetCollection.set(file, attachment);
		}

		Logger.log(`Loaded ${assetCollection.size} assets!`);
		this.assets = assetCollection;
	}

	/** Load collected commands. */
	public async loadCommands(): Promise<void> {
		const commands = await ImpostorClient.collectCommands();
		for (const [name, command] of commands) {
			this.commands.set(name, new Command({
				client: this,
				data: command.data,
				execute: command.execute,
			}));
		}
		Logger.log(`Loaded ${this.commands.size} commands!`);
	}

	/** Traverse and load all command files in the commands directory. Returns the commands. */
	public static async collectCommands(): Promise<Collection<string, CommandBlueprint>> {
		const commands = new Collection<string, CommandBlueprint>();
		const commandsPath = path.join(__dirname, '../commands');
		const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

		let ctr = 0;

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);

			Logger.log(`Loading command file: ${filePath}`);

			if (!filePath.startsWith(commandsPath))
				throw new Error(`Attempted to load file outside commands directory: ${filePath}`);

			const module = await import(filePath).catch((error) => {
				throw new Error(`Error loading command file ${filePath}: ${error}`);
			});

			const command = module as CommandBlueprint;

			if (command.data instanceof SlashCommandBuilder) {
				commands.set(command.data.name, {
					data: command.data,
					execute: command.execute,
				});
				++ctr;
			} else {
				throw new Error(`Command ${file} does not have a valid data property`);
			}
		}

		Logger.log(`Collected ${ctr} commands!`);

		return commands;
	}

	/** Load all event files in the events directory. */
	public async loadEvents(): Promise<void> {
		const eventsPath = path.join(__dirname, '../events');
		const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

		let ctr = 0;

		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);

			Logger.log(`Loading event file: ${filePath}`);

			if (!filePath.startsWith(eventsPath))
				throw new Error(`Attempted to load file outside events directory: ${filePath}`);

			const module = await import(filePath).catch((error) => {
				throw new Error(`Error loading event file ${filePath}: ${error}`);
			});

			const event = new Event(module);

			if (event.name && event.execute) {
				this.on(event.name, async (...args) => {
					try {
						await event.execute(this, ...args);	
					} catch (error) {
						Logger.error(`Error executing event ${event.name}: ${error}`);
					}
				});
				++ctr;
			} else {
				throw new Error(`Event ${file} does not have a valid name or execute method`);
			}
		}

		Logger.log(`Loaded ${ctr} events!`);
	}
}
