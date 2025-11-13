import { Events, MessageFlags, time, TimestampStyles } from "discord.js";
import { formatDurationMs } from "../../utils/formatTime.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const id = interaction.customId;
    if (id !== "guard.clock-in" && id !== "guard.clock-out") return;

    const { userService, sessionService } = interaction.services;
    const user = await userService.getOneDiscordId(interaction.user.id);

    await interaction.deferUpdate();

    try {
      if (id === "guard.clock-in") {
        const startResult = await sessionService.start(user.id);

        if (!startResult) {
          return interaction.editReply({
            content: "Looks like you're already clocked in. Try `/clock-out`.",
            components: [],
          });
        }

        const started = time(startResult.startedAt, TimestampStyles.ShortTime);
        return interaction.editReply({
          content: `✅ **Clocked in!**\nStarted: ${started}`,
          components: [],
        });
      }

      const endResult = await sessionService.end(user.id);
      if (!endResult) {
        return interaction.editReply({
          content: "Looks like you're already clocked out. Try `/clock-in`.",
          components: [],
        });
      }

      const { session, durationMs } = endResult;
      const started = time(session.startedAt, TimestampStyles.ShortTime);
      const ended = time(session.endedAt, TimestampStyles.ShortTime);
      const durationText = formatDurationMs(durationMs, { mode: "round" });
      const activityText = session.activity ? `\nWorked on: ${session.activity}` : "";
      return interaction.editReply({
        content:
          `✅ **Clocked out**\n` +
          `Started: ${started}\n` +
          `Ended: ${ended}\n` +
          `Duration: ${durationText}${activityText}`,
        components: [],
      });
    } catch (err) {
      console.error("Guard button error:", err);
      return interaction.followUp({
        content: "Errmmm you broke something wasn't me!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
