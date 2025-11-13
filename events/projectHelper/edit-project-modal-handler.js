import { Events, MessageFlags } from "discord.js";
import { displayActiveProjects } from "../../utils/displayProjects.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit() || !interaction.customId.startsWith("edit_project_modal:"))
      return;
    const projectId = interaction.customId.split(":")[1];
    const { projectService, userService } = interaction.services;

    const name = interaction.fields.getTextInputValue("name").trim();
    const description = interaction.fields.getTextInputValue("description").trim();

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = await userService.getOneDiscordId(interaction.user.id);
      const project = await projectService.update({
        id: projectId,
        userId: user.id,
        args: { name, description },
      });
      if (!project) throw new Error("Project update returned null");
      console.log(`Project ${projectId} updated by ${interaction.user.tag}`);
      await interaction.editReply(`✅ Project **${project?.name}** updated successfully.`);
      await displayActiveProjects(
        interaction.client,
        projectService,
        "1417419956718534697",
        "1435979361009406012",
      );
    } catch (err) {
      console.error("Edit project modal error:", err);
      await interaction.editReply("Something went wrong while updating the project.");
    }
  },
};
