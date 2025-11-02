import { MessageFlags } from "discord.js";

/**
 * Send an ephemeral message that works whether the interaction was deferred, replied, or fresh.
 * @param {Object} interaction - Discord interaction object
 * @param {string|Object} options - Message content (string) or full message options (object)
 * @returns {Promise<Message>}
 */
export async function replyEphemeral(interaction, options) {
  const data = typeof options === "string" ? { content: options } : options;

  if (interaction.deferred) {
    return interaction.editReply(data);
  }

  if (interaction.replied) {
    return interaction.followUp({ ...data, flags: MessageFlags.Ephemeral });
  }

  return interaction.reply({ ...data, flags: MessageFlags.Ephemeral });
}
