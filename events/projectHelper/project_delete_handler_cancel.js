import { Events, MessageFlags } from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    console.log(interaction.customId);
    if (interaction.customId === "cancel_delete") {
      await interaction.update({ content: "Cancelled.", components: [] });
    }
  },
};
