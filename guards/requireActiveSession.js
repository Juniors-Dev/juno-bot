import hasSession from "./hasSession.js";
import { MessageFlags } from "discord.js";

export async function requireActiveSession(interaction) {
  if (!(await hasSession(interaction))) {
    await interaction.reply({
      content: "You're not clocked in. Use `/clock-in` first.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}
