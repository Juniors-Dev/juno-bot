import { replyEphemeral } from "../utils/reply.js";

export async function requireNoActiveSession(interaction) {
  if (!interaction.activeSession) return true;
  //TODO: Add clock out button
  await replyEphemeral(interaction, "You're already clocked in. Use `/clock-out` first.");
  return false;
}
