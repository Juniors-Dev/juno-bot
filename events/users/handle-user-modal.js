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
    if (interaction.isModalSubmit() && interaction.customId === "create_user_modal") {
      const { userService } = interaction.services;

      const name = interaction.fields.getTextInputValue("name").trim();
      const gh = interaction.fields.getTextInputValue("gh").trim();

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
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
      } catch (err) {
        await interaction.editReply("Errmmm you broke something wasn't me!.");
      }
    }
  },
};
