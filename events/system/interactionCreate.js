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
      // ---------- SPECIAL CASE: /health ----------
      if (interaction.commandName === "health") {
        console.log("[GLOBAL] running /health without user/session pre-checks");
        await command.execute(interaction);
        return;
      }

      // ---------- NORMAL FLOW FOR OTHER COMMANDS ----------
      const { userService, sessionService } = interaction.services;

      // Get user from DB
      let user;
      try {
        user = await userService.getOneDiscordId(interaction.user.id);
      } catch (err) {
        console.error("[GLOBAL] userService.getOneDiscordId failed (DB likely down):", err);
        await sendReply(interaction, "⚠️ The database seems unavailable. Please try again later.", {
          ephemeral: true,
        });
        return;
      }

      if (!user) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const button = new ButtonBuilder()
          .setCustomId("create_user_modal_button")
          .setLabel("Create User")
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.editReply({
          content: "You’re not in the database yet. Click below to create a profile.",
          components: [row],
        });
        return;
      }

      // Get active session
      let session;
      try {
        session = await sessionService.getOneActive(user.id);
      } catch (err) {
        console.error("[GLOBAL] sessionService.getOneActive failed (DB likely down):", err);
        await sendReply(interaction, "⚠️ The database seems unavailable. Please try again later.", {
          ephemeral: true,
        });
        return;
      }

      interaction.context = {
        user,
        session,
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
