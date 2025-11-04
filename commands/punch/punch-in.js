import { SlashCommandBuilder, MessageFlags, time, TimestampStyles } from "discord.js";
import { requireNoActiveSession } from "../../guards/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-in")
    .setDescription("Start tracking your work session")
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("What are you working on? (optional)")
        .setRequired(false),
    ),
  guards: [requireNoActiveSession],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { user } = interaction.context;

      const activity = interaction.options.getString("activity")?.trim() || null;
      const session = await sessionService.start(user.id, { activity });
      if (!session)
        return interaction.editReply("You're already clocked in. Use `/clock-out` first.");

      const started = time(session.startedAt, TimestampStyles.ShortTime);
      const activityText = activity ? `\nWorking on: ${activity}` : "";
      await interaction.editReply(`✅ **Clocked in!**\nStarted: ${started}${activityText}`);
      // TODO: Update dashboard
    } catch (err) {
      console.error("Clock-in error:", err);
      await interaction.editReply("Something went wrong");
    }
  },
};
