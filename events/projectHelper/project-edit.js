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
    // Only handle the project creation button
    if (!interaction.customId.startsWith("project_edit:")) return;
    const projectId = interaction.customId.split(":")[1];
    const { projectService } = interaction.services;
    const project = await projectService.getById(projectId);

    // Build and show modal
    const modal = new ModalBuilder()
      .setCustomId("edit_project_modal:" + projectId)
      .setTitle(`Edit: ${project.name}`);

    const nameInput = new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Project Name")
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setValue(project.name);

    const descInput = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Project Description")
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(project.description);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(descInput),
    );

    await interaction.showModal(modal);
  },
};
