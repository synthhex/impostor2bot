import { Interaction, SlashCommandBuilder } from 'discord.js';
import ImpostorClient from './client';

export interface CommandBlueprint {
	data: SlashCommandBuilder;
	execute: (client: ImpostorClient, interaction: Interaction) => Promise<void>;
}

export default class Command {
	public data: SlashCommandBuilder;
	public execute: (client: ImpostorClient, interaction: Interaction) => Promise<void>;

	private client: ImpostorClient;
	private disabled: boolean = false;

	constructor(options: { client: ImpostorClient, data: SlashCommandBuilder; execute: (client: ImpostorClient, interaction: Interaction) => Promise<void> }) {
		this.client = options.client;
		this.data = options.data;
		this.execute = options.execute;
	}

	public static createCommand(options: {
		client: ImpostorClient,
		data: SlashCommandBuilder;
		execute: (client: ImpostorClient, interaction: Interaction) => Promise<void>;
	}): Command {
		return new Command(options);
	}

	public isDisabled(): boolean {
		return this.disabled;
	}

	public disable() {
		this.disabled = true;
	}

	public enable() {
		this.disabled = false;
	}
}
