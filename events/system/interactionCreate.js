import { Events, ActionRowBuilder, ButtonStyle, ButtonBuilder, MessageFlags } from "discord.js";
import { replyEphemeral } from "../../utils/respond.js";

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
      const { userService, sessionService } = interaction.services;
      const dbUser = await userService.getOneDiscordId(interaction.user.id);
      if (!dbUser) {
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

      interaction.dbUser = dbUser;
      interaction.activeSession = await sessionService.getOneActive(dbUser.id);

      if (command.guards?.length) {
        for (const guard of command.guards) {
          const passed = await guard(interaction);
          if (!passed) return;
        }
      }

      await command.execute(interaction);
    } catch (error) {
      console.error("interactionCreate error:", error);
      await replyEphemeral(interaction, "Something broke.");
    }
  },
};
