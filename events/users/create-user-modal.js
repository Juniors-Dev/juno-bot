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
    // --- handle button ---
    if (interaction.isModalSubmit() && interaction.customId === "create_user_modal") {
      const { userService } = interaction.services;

      const name = interaction.fields.getTextInputValue("name").trim();
      const gh = interaction.fields.getTextInputValue("gh").trim();

      await interaction.deferReply({ ephemeral: true });

      const existing = await userService.getOneDiscordId(interaction.user.id);

      if (existing) {
        return interaction.editReply("User already exists.");
      }

      await userService.create({
        discordId: interaction.user.id,
        githubUsername: gh || null,
        name,
      });

      await interaction.editReply("✅ User created successfully.");
    } else if (interaction.customId === "create_user_modal_button") {
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
