import { Events, MessageFlags } from "discord.js";
import { buildClockOutMessagePayload } from "../../features/session/sessionMessageBuilder.js";
import { cancelTimer } from "../../features/session/timerManager.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() || interaction.customId !== "guard.clock-out") return;

    const { userService, sessionService } = interaction.services;
    const user = await userService.getOneDiscordId(interaction.user.id);

    await interaction.deferUpdate();

    try {
      const activeSession = await sessionService.getOneActive(user.id);
      if (activeSession) {
        cancelTimer(activeSession.id);
      }

      const result = await sessionService.end(user.id);

      if (!result) {
        return interaction.editReply({
          content: "Already clocked out ✓",
          components: [],
        });
      }

      const payload = buildClockOutMessagePayload(result);
      return interaction.editReply(payload);
    } catch (err) {
      console.error("Guard: Clock-out button error:", err);
      return interaction.followUp({
        content: "Errmmm you broke something wasn't me! 👀",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
