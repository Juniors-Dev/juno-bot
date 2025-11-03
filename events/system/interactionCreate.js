import { Events, ActionRowBuilder, ButtonStyle, ButtonBuilder, MessageFlags } from "discord.js";
import { sendReply } from "../../utils/reply.js";

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
      const user = await userService.getOneDiscordId(interaction.user.id);
      if (!user) {
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

      const session = await sessionService.getOneActive(user.id);

      interaction.context = {
        user,
        session,
        // settings,
        // isProDuck,
        // any other existential baggage your user might have
      };

      if (command.guards?.length) {
        for (const guard of command.guards) {
          const passed = await guard(interaction);
          if (!passed) return;
        }
      }

      await command.execute(interaction);
    } catch (error) {
      console.error("interactionCreate error:", error);
      await sendReply(interaction, "Something broke.", { ephemeral: true });
    }
  },
};
