import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";

/**
 * Builds the content + components for the Project Manager dashboard.
 * @param {Array} projects - List of user projects
 * @param {string|null} selectedId - Currently selected project ID (optional)
 * @returns {{ content: string, components: any[] }}
 */
export function renderProjectManager(projects = [], selectedId = null) {
  // Base message text
  let content = "📋 **Project Manager**\n";
  if (!projects.length) {
    content += "You don’t have any active projects yet.\n\nClick below to create one!";
  } else if (selectedId) {
    const selected = projects.find((p) => p.id === selectedId);
    content += `Currently managing: **${selected?.name || "Unknown"}**\n\nSelect a project or use the actions below.`;
  } else {
    content += "Select a project from the dropdown, then choose an action below.";
  }

  // --- Top row: global actions ---
  const globalActions = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("project_create")
      .setLabel("➕ Create Project")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("project_dashboard")
      .setLabel("📊 View Dashboard")
      .setStyle(ButtonStyle.Secondary),
  );

  // --- Middle row: dropdown ---
  const projectSelect = new StringSelectMenuBuilder()
    .setCustomId("project_select")
    .setPlaceholder("Select a project to manage…")
    .addOptions(
      projects.map((p) => ({
        label: p.name,
        value: p.id,
        description: p.description?.slice(0, 80) || "No description provided.",
        default: p.id === selectedId, // mark the selected project if any
      })),
    );

  const dropdownRow = new ActionRowBuilder().addComponents(projectSelect);

  // --- Bottom row: project actions ---
  const projectActions = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`project_edit${selectedId ? `:${selectedId}` : ""}`)
      .setLabel("✏️ Edit Project")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!selectedId),
    new ButtonBuilder()
      .setCustomId(`project_links${selectedId ? `:${selectedId}` : ""}`)
      .setLabel("🔗 Manage Links")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!selectedId),
    new ButtonBuilder()
      .setCustomId(`project_members${selectedId ? `:${selectedId}` : ""}`)
      .setLabel("👥 Manage Members")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!selectedId),
    new ButtonBuilder()
      .setCustomId(`project_delete${selectedId ? `:${selectedId}` : ""}`)
      .setLabel("🗑️ Delete Project")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!selectedId),
  );

  const components = projects.length
    ? [globalActions, dropdownRow, projectActions]
    : [globalActions];

  return { content, components };
}
