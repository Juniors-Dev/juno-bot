import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { discordTs } from "../../utils/time.js";
import { requireNoActiveSession } from "../../guards/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-in")
    .setDescription("Start tracking your work session")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("What are you working on? (optional)")
        .setRequired(false),
    ),
  guards: [requireNoActiveSession],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { user } = interaction.context;

      const activity = interaction.options.getString("status")?.trim() || null;
      const session = await sessionService.start(user.id, { activity });
      if (!session)
        return interaction.editReply("You're already clocked in. Use `/clock-out` first.");

      const started = discordTs(session.startedAt, "t");
      const activityText = activity ? `\nWorking on: ${activity}` : "";
      await interaction.editReply(`✅ **Clocked in!**\nStarted: ${started}${activityText}`);
      // TODO: Update dashboard
    } catch (err) {
      console.error("Clock-in error:", err);
      await interaction.editReply("Something went wrong");
    }
  },
};
