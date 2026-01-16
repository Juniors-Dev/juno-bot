import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { renderLinkManager } from "../../../../../features/projects/links/renderLinkManager.js";

export async function projectLinkDeleteConfirmation(interaction) {
  if (interaction.customId.startsWith("project_link_delete:")) {
    const [customId, linkId, projectId] = interaction.customId.split(":");
    console.log(linkId, projectId);
    const { projectService } = interaction.services;
    const { user } = interaction.botContext;
    const projects = await projectService.listByUser(user.id);
    const { content, components } = renderLinkManager({
      projects,
      linkId,
      selectedId: projectId,
      isConfirmingDelete: true,
    });
    await interaction.update({ content, components });
  }
}
