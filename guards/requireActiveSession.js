import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { replyEphemeral } from "../utils/reply.js";

export async function requireActiveSession(interaction) {
  if (interaction.context?.session) return true;

  const clockInButton = new ButtonBuilder()
    .setCustomId("guard.clock-in")
    .setLabel("Clock In")
    .setStyle(ButtonStyle.Success)
    .setEmoji("⏱️");

  const row = new ActionRowBuilder().addComponents(clockInButton);

  await replyEphemeral(interaction, {
    content: "You're not clocked in.",
    components: [row],
  });
  return false;
}
