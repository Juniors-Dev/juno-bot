import { MessageFlags } from "discord.js";
import { displayActiveProjects } from "../../../../utils/displayProjects.js";

export async function handleProjectCreateModal(interaction) {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "create_project_modal") return;
  if (!interaction.botContext.user) return;
  const { projectService, userService } = interaction.services;
  const name = interaction.fields.getTextInputValue("name").trim();
  const description = interaction.fields.getTextInputValue("description").trim();

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const user = await userService.getOneDiscordId(interaction.user.id);
    const existingProjects = await projectService.listByUser(user.id);
    if (existingProjects.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      return interaction.editReply("You already have a project with that name.");
    }

    const project = await projectService.create({
      name,
      description,
      ownerId: user.id,
    });

    await interaction.editReply(`✅ Project **${project?.name}** created successfully.`);
    await displayActiveProjects(
      interaction.client,
      projectService,
      "1417419956718534697",
      "1435979361009406012",
    );
  } catch (err) {
    console.error("Create project modal error:", err);
    await interaction.editReply("Something went wrong while creating the project.");
  }
}
