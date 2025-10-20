import { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("create-user")
    .setDescription("Create new user in database"),

  async execute(interaction) {
    console.log("creating form");
    await interaction.deferReply({ ephemeral: true }); // acknowledges immediately
    try {
      const { userService } = interaction.services;
      const isUser = await userService.getOneDiscordId(interaction.user.id);
      if (isUser) {
        return interaction.editReply({ content: "User already exists.", ephemeral: true });
      }

      const button = new ButtonBuilder()
        .setCustomId("create_user_modal_button")
        .setLabel("Create User")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      return interaction.editReply({
        content: "You’re not in the database yet. Click below to create a profile.",
        components: [row],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      await interaction.editReply({ content: "Oops and error occurred", ephemeral: true });
    }
  },
};
