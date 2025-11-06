import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { replyEphemeral } from "../utils/reply.js";

export async function requireNoActiveSession(interaction) {
  if (!interaction.context?.session) return true;

  const clockOutButton = new ButtonBuilder()
    .setCustomId("guard.clock-out")
    .setLabel("Clock Out")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(clockOutButton);

  await replyEphemeral(interaction, {
    content: "You're already clocked in.",
    components: [row],
  });
  return false;
}
