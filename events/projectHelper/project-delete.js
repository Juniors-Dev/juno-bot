import { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId.startsWith("project_delete:")) {
      const projectId = interaction.customId.split(":")[1];

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_project_delete:${projectId}`)
          .setLabel("Yes, delete")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("cancel_delete")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary),
      );

      await interaction.reply({
        content: `⚠️ Are you sure you want to delete this project? This cannot be undone.`,
        components: [row],
        ephemeral: true,
      });
    }
  },
};
