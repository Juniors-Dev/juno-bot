import { Events, MessageFlags } from "discord.js";
import { displayActiveProjects } from "../../utils/displayProjects.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    console.log("interaction.customId");
    if (!interaction.customId.startsWith("confirm_project_delete:")) return;
    const projectId = interaction.customId.split(":")[1];
    const { projectService, userService } = interaction.services;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = await userService.getOneDiscordId(interaction.user.id);
      await projectService.archive({ id: projectId, userId: user.id });
      await interaction.editReply({
        content: "🗑️ Project deleted.",
        components: [],
      });
      await displayActiveProjects(
        interaction.client,
        projectService,
        "1417419956718534697",
        "1435979361009406012",
      );
    } catch (err) {
      console.error("Delete project error:", err);
      await interaction.editReply({
        content: "❌ Something went wrong deleting the project.",
        components: [],
      });
    }
  },
};
