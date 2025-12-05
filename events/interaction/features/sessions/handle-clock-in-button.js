import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import {
  DEFAULT_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
} from "../../../../features/session/constants.js";

export async function handleClockInButton(interaction) {
  const modal = new ModalBuilder().setCustomId("clock_in_modal").setTitle("Clock In");

  const activityInput = new TextInputBuilder()
    .setCustomId("activity")
    .setLabel("What are you working on?")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("e.g., peeling potatoes.");

  const durationInput = new TextInputBuilder()
    .setCustomId("duration")
    .setLabel(`How long will you work? (${MIN_SESSION_MINUTES}-${MAX_SESSION_MINUTES} minutes)`)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder(`defaults to ${DEFAULT_SESSION_MINUTES} minutes`);

  modal.addComponents(
    new ActionRowBuilder().addComponents(activityInput),
    new ActionRowBuilder().addComponents(durationInput),
  );

  await interaction.showModal(modal);
}
