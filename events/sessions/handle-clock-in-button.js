import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() || interaction.customId !== "clock_in_button") return;

    const modal = new ModalBuilder().setCustomId("clock_in_modal").setTitle("Clock In");

    const activityInput = new TextInputBuilder()
      .setCustomId("activity")
      .setLabel("What are you working on? (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("e.g., Working on authentication feature");

    const durationInput = new TextInputBuilder()
      .setCustomId("duration")
      .setLabel("Planned duration (minutes) (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("e.g., 60");

    modal.addComponents(
      new ActionRowBuilder().addComponents(activityInput),
      new ActionRowBuilder().addComponents(durationInput),
    );

    await interaction.showModal(modal);
  },
};
