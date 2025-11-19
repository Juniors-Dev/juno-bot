import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { buildClockInMessagePayload } from "../../features/session/messageBuilder.js";
import { startTimer } from "../../features/session/timerManager.js";
import { requireNoActiveSession } from "../../guards/index.js";
import {
  DEFAULT_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
} from "../../features/session/constants.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-in")
    .setDescription("Start tracking your work session")
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("What are you working on? (optional)")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Planned duration in minutes (optional)")
        .setRequired(false)
        .setMinValue(MIN_SESSION_MINUTES)
        .setMaxValue(MAX_SESSION_MINUTES),
    ),
  guards: [requireNoActiveSession],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { user } = interaction.botContext;

      const activity = interaction.options.getString("activity")?.trim() || null;
      const durationOptionMinutes = interaction.options.getInteger("duration");

      const plannedDurationMinutes =
        typeof durationOptionMinutes === "number" ? durationOptionMinutes : DEFAULT_SESSION_MINUTES;

      const session = await sessionService.start(user.id, {
        activity,
        targetDurationMinutes: plannedDurationMinutes,
      });

      startTimer(interaction.client, session, plannedDurationMinutes);

      const payload = buildClockInMessagePayload({
        session,
        targetDurationMinutes: plannedDurationMinutes,
        activity,
      });

      await interaction.editReply(payload);
      // TODO: Update dashboard
    } catch (err) {
      console.error("Clock-in error:", err);
      await interaction.editReply("Something went wrong..👀");
    }
  },
};
