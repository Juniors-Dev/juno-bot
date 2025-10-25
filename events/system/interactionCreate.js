import { Events, ActionRowBuilder, ButtonStyle, ButtonBuilder, MessageFlags } from "discord.js";
import { guardMap } from "../../guards/index.js";

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
      const { userService } = interaction.services;
      const isUser = await userService.getOneDiscordId(interaction.user.id);
      if (!isUser) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const button = new ButtonBuilder()
          .setCustomId("create_user_modal_button")
          .setLabel("Create User")
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        return interaction.editReply({
          content: "You’re not in the database yet. Click below to create a profile.",
          components: [row],
        });
      }

      if (command.guards?.length) {
        for (const guardName of command.guards) {
          const guard = guardMap[guardName];

          if (!guard) {
            console.error(`Unknown guard: ${guardName}`);
            await interaction.reply({
              content: "Configuration error.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const passed = await guard(interaction);
          if (!passed) return;
        }
      }

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
