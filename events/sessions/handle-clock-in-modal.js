import { Events, MessageFlags } from "discord.js";
import { startTimer } from "../../features/session/timerManager.js";
import { buildClockInMessagePayload } from "../../features/session/sessionMessageBuilder.js";
import { DEFAULT_SESSION_MINUTES, MAX_SESSION_MINUTES } from "../../features/session/constants.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== "clock_in_modal") return;

    const { userService, sessionService } = interaction.services;
    const user = await userService.getOneDiscordId(interaction.user.id);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const activity = interaction.fields.getTextInputValue("activity")?.trim() || null;
      const durationInput = interaction.fields.getTextInputValue("duration")?.trim();

      let plannedDurationMinutes = DEFAULT_SESSION_MINUTES;
      if (durationInput) {
        const parsed = parseInt(durationInput, 10);
        if (!isNaN(parsed) && parsed >= 10 && parsed <= MAX_SESSION_MINUTES) {
          plannedDurationMinutes = parsed;
        }
      }

      const result = await sessionService.start(user.id, {
        activity,
        targetDurationMinutes: plannedDurationMinutes,
      });

      if (!result) {
        try {
          await interaction.message.edit({
            content: "Already clocked in ✓",
            components: [],
          });
        } catch (editErr) {
          if (editErr.code !== 10008) {
            console.warn("[Clock-in Modal] Failed to edit guard message:", editErr.message);
          }
        }
        return interaction.editReply({
          content: "You're already clocked in. Use `/clock-out` when you're done.",
        });
      }

      startTimer(interaction.client, result, plannedDurationMinutes);

      const payload = buildClockInMessagePayload({
        session: result,
        targetDurationMinutes: plannedDurationMinutes,
        activity,
      });

      try {
        await interaction.message.edit({
          content: "✅ You're now clocked in!",
          components: [],
        });
      } catch (editErr) {
        if (editErr.code !== 10008) {
          console.warn("[Clock-in Modal] Failed to edit guard message:", editErr.message);
        }
      }
      return interaction.editReply(payload);
    } catch (err) {
      console.error("[Clock-in Modal] Error:", err);
      return interaction.editReply({
        content: "Errmmm you broke something wasn't me! 👀",
      });
    }
  },
};
