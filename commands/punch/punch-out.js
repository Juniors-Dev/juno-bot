import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { formatDurationMs, discordTs } from "../../utils/time.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-out")
    .setDescription("End your current work session"),

  guards: ["activeSession"],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { dbUser } = interaction;

      const result = await sessionService.end(dbUser.id);
      if (!result) {
        return interaction.editReply("You're not clocked in. Use `/clock-in` first.");
      }

      const { session, durationMs } = result;

      const started = discordTs(session.startedAt, "t");
      const ended = discordTs(session.endedAt, "t");
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
