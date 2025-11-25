import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { buildClockOutMessagePayload } from "../../features/session/messageBuilder.js";
import { requireActiveSession } from "../../guards/index.js";
import { cancelTimer } from "../../features/session/timerManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clock-out")
    .setDescription("End your current work session"),
  guards: [requireActiveSession],

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { sessionService } = interaction.services;
      const { user, session } = interaction.botContext;

      if (session) {
        cancelTimer(session.id);
      }

      const result = await sessionService.end(user.id);

      const payload = buildClockOutMessagePayload(result);
      await interaction.editReply(payload);
      // TODO: Update dashboard
    } catch (err) {
      console.error("Clock-out error:", err);
      await interaction.editReply("Something went wrong..👀");
    }
  },
};
