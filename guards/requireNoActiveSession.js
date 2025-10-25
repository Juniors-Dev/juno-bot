import hasSession from "./hasSession.js";
import { MessageFlags } from "discord.js";

export async function requireNoActiveSession(interaction) {
  if (await hasSession(interaction)) {
    await interaction.reply({
      content: "You're already clocked in. Use `/clock-out` first.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}
