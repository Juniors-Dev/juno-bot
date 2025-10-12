import { Events } from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`❌ No command matching ${interaction.commandName} found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("Something broke.");
      } else {
        await interaction.reply({ content: "Something broke.", ephemeral: true });
      }
    }
  },
};
