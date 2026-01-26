import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { refreshDashboard } from "../../task-dashboard-state.js";
import {
  buildTaskDashboard,
  buildDeleteConfirmation,
  buildV2Message,
} from "../../task-dashboard-ui.js";

async function handleNew(interaction) {
  const modal = new ModalBuilder().setCustomId("tasks:new_modal").setTitle("Create New Task");

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel("Task title")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200)
    .setPlaceholder("e.g., Implement user authentication");

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel("Description (optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000)
    .setPlaceholder("Add any notes or details...");

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(descriptionInput),
  );
  await interaction.showModal(modal);
}

async function handleEdit(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  try {
    const task = await taskService.getById(taskId, user.id, { includeProject: true });

    if (!task) {
      await interaction.reply({
        ...buildV2Message("⚠️ Task not found.", { type: "warning" }),
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`tasks:edit_modal:${taskId}`)
      .setTitle("Edit Task");

    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Task title")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(200)
      .setValue(task.title);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Description (optional)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(1000)
      .setValue(task.description || "");

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput),
    );

    await interaction.showModal(modal);
  } catch (err) {
    console.error("[Task Dashboard] Edit button error:", err);
    await interaction.reply({
      ...buildV2Message("Failed to open edit dialog. Please try again."),
    });
  }
}

async function handleArchive(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const archived = await taskService.archive(taskId, user.id);

    if (!archived) {
      return interaction.editReply(
        buildV2Message("⚠️ Task not found or could not be archived.", { type: "warning" }),
      );
    }

    const { filter, tasks } = await refreshDashboard(interaction);
    const payload = buildTaskDashboard(tasks, {
      filter,
      notification: "📦 Task archived.",
    });
    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Archive error:", err);
    await interaction.editReply(buildV2Message("Something went wrong archiving the task."));
  }
}

async function handleDelete(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const task = await taskService.getById(taskId, user.id);

    if (!task) {
      return interaction.editReply(buildV2Message("⚠️ Task not found.", { type: "warning" }));
    }

    const payload = buildDeleteConfirmation(task);
    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Delete button error:", err);
    await interaction.editReply(buildV2Message("Failed to load delete confirmation."));
  }
}

async function handleDeleteConfirm(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const deleted = await taskService.delete(taskId, user.id);

    if (!deleted) {
      return interaction.editReply(
        buildV2Message("⚠️ Task not found or already deleted.", { type: "warning" }),
      );
    }

    const { filter, tasks } = await refreshDashboard(interaction);
    const payload = buildTaskDashboard(tasks, {
      filter,
      notification: "🗑️ Task deleted.",
    });
    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Delete confirm error:", err);
    await interaction.editReply(buildV2Message("Something went wrong deleting the task."));
  }
}

export const buttonHandlers = {
  new: handleNew,
  edit: handleEdit,
  archive: handleArchive,
  delete: handleDelete,
  delete_confirm: handleDeleteConfirm,
};
