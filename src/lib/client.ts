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
import Command from './command';
import { readdirSync } from 'fs';
import Event from './event';
import path from 'path';
import { log } from '../utils/logger';
import SessionManager from './manager';

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
		sessionManager: SessionManager;
		getOutOfJail: Set<string>;
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
	public sessionManager: SessionManager = new SessionManager(this);
	public getOutOfJail: Set<string> = new Set();

	public assets: Collection<string, AttachmentBuilder> = new Collection();

	constructor(config: ClientOptions) {
		super(config);
	}

	public shouldBeFreed(user: GuildMember): boolean {
		if (this.getOutOfJail.has(user.id)) {
			this.getOutOfJail.delete(user.id);
			return true;
		}
		return false;
	}

	public free(user: GuildMember): void {
		if (this.getOutOfJail.has(user.id)) return;
		this.getOutOfJail.add(user.id);
	}

	public safeAsset(name: string): [AttachmentBuilder] | [] {
		const asset = this.assets.get(name);
		if (!asset) {
			log(`Asset ${name} not found!`);
			return [];
		}
		return [asset];
	}

	public async loadAssets(): Promise<void> {
		const assets = ['nope.gif', 'bi.png', 'mult.gif', 'thumb.png', 'disintegrate.png', 'gus.jpeg'];
		const assetsPath = path.join(__dirname, '../../assets');
		const assetCollection = new Collection<string, AttachmentBuilder>();

		for (const file of assets) {
			const filePath = path.join(assetsPath, file);
			log(`Loading asset file: ${filePath}`);
			if (!filePath.startsWith(assetsPath))
				throw new Error(`Attempted to load file outside assets directory: ${filePath}`);
			const attachment = new AttachmentBuilder(filePath);
			assetCollection.set(file, attachment);
		}

		log(`Loaded ${assetCollection.size} assets!`);
		this.assets = assetCollection;
	}

	public async loadCommands(): Promise<void> {
		const commands = await ImpostorClient.collectCommands();
		this.commands = commands;
		console.log(this.commands);
		log(`Loaded ${this.commands.size} commands!`);
	}

	public static async collectCommands(): Promise<Collection<string, Command>> {
		const commands = new Collection<string, Command>();
		const commandsPath = path.join(__dirname, '../commands');
		const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

		let ctr = 0;

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);

			log(`Loading command file: ${filePath}`);

			if (!filePath.startsWith(commandsPath))
				throw new Error(`Attempted to load file outside commands directory: ${filePath}`);

			const module = await import(filePath).catch((error) => {
				throw new Error(`Error loading command file ${filePath}: ${error}`);
			});

			const command = module as Command;

			if (command.data instanceof SlashCommandBuilder) {
				commands.set(command.data.name, command);
				++ctr;
			} else {
				throw new Error(`Command ${file} does not have a valid data property`);
			}
		}

		log(`Collected ${ctr} commands!`);

		return commands;
	}

	public async loadEvents() {
		const eventsPath = path.join(__dirname, '../events');
		const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

		let ctr = 0;

		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);

			log(`Loading event file: ${filePath}`);

			if (!filePath.startsWith(eventsPath))
				throw new Error(`Attempted to load file outside events directory: ${filePath}`);

			const module = await import(filePath).catch((error) => {
				throw new Error(`Error loading event file ${filePath}: ${error}`);
			});

			const event = module as Event;

			if (event.name && event.execute) {
				this.on(event.name, (...args) => event.execute(...args));
				++ctr;
			} else {
				throw new Error(`Event ${file} does not have a valid name or execute method`);
			}
		}

		log(`Loaded ${ctr} events!`);
	}
}
