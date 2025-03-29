import { Interaction, SlashCommandBuilder } from 'discord.js';

export default class Command {
	public data: SlashCommandBuilder;
	public execute: (interaction: Interaction) => Promise<void>;

	private disabled: boolean = false;

	constructor(options: { data: SlashCommandBuilder; execute: (interaction: Interaction) => Promise<void> }) {
		this.data = options.data;
		this.execute = options.execute;
	}

	public static createCommand(options: {
		data: SlashCommandBuilder;
		execute: (interaction: Interaction) => Promise<void>;
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
