import { replyEphemeral } from "../utils/reply.js";

export async function requireActiveSession(interaction) {
  if (interaction.botContext?.session) return true;
  //TODO: Add clock in button
  await replyEphemeral(interaction, "You're not clocked in. Use `/clock-in` first.");
  return false;
}
