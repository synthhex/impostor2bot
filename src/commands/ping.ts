import { Interaction, MessageFlags, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping the bot to check if it's alive.");

export const execute = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
}