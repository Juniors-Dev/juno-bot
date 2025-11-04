import { SlashCommandBuilder, MessageFlags, time, TimestampStyles } from "discord.js";
import { formatDurationMs } from "../../utils/formatTime.js";
import { requireActiveSession } from "../../guards/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-out")
    .setDescription("End your current work session"),
  guards: [requireActiveSession],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { user } = interaction.context;

      const result = await sessionService.end(user.id);
      if (!result) return interaction.editReply("You're not clocked in. Use `/clock-in` first.");

      const { session, durationMs } = result;
      const started = time(session.startedAt, TimestampStyles.ShortTime);
      const ended = time(session.endedAt, TimestampStyles.ShortTime);
      const durationText = formatDurationMs(durationMs, { mode: "round" });
      const activityText = session.activity ? `\nWorked on: ${session.activity}` : "";

      await interaction.editReply(
        `✅ **Clocked out**\n` +
          `Started: ${started}\n` +
          `Ended: ${ended}\n` +
          `Duration: ${durationText}${activityText}`,
      );
      // TODO: Update dashboard
    } catch (err) {
      console.error("Clock-out error:", err);
      await interaction.editReply("Something went wrong");
    }
  },
};
