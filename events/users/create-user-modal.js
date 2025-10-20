import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // --- handle button ---
    if (interaction.customId === "create_user_modal_button") {
      console.log("form time!");
      // Build the modal
      const modal = new ModalBuilder().setCustomId("create_user_modal").setTitle("Create User");

      const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Name")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const ghInput = new TextInputBuilder()
        .setCustomId("gh")
        .setLabel("GitHub username (optional)")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(ghInput),
      );

      await interaction.showModal(modal);
    }
  },
};
