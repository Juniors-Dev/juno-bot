import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { setState, refreshDashboard } from "../task-dashboard-state.js";
import {
  buildTaskDashboard,
  buildTaskDetail,
  buildDeleteConfirmation,
  buildV2Message,
  STATUS_CONFIG,
} from "../task-dashboard-ui.js";
import { getTaskDetailContext } from "../task-dashboard-helpers.js";
import {
  DEFAULT_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
} from "../../../../../features/session/constants.js";
import { TASK_STATUS } from "../../../../../services/TaskService.js";

async function handleNewTaskButton(interaction) {
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

async function handleBackButton(interaction) {
  setState(interaction.user.id, { selectedTaskId: null });

  await interaction.deferUpdate();

  try {
    const { filter, tasks } = await refreshDashboard(interaction);
    const payload = buildTaskDashboard(tasks, { filter });
    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Back error:", err);
    await interaction.editReply(buildV2Message("Something went wrong returning to task list."));
  }
}

async function handleStatusChange(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const parts = interaction.customId.split(":");
  const newStatus = parts[2];
  const taskId = parseInt(parts[3], 10);

  await interaction.deferUpdate();

  try {
    const updatedTask = await taskService.updateStatus(taskId, user.id, newStatus);

    if (!updatedTask) {
      return interaction.editReply(
        buildV2Message("⚠️ Task not found or could not be updated.", { type: "warning" }),
      );
    }

    const task = await taskService.getById(taskId, user.id, { includeProject: true });
    const session = await sessionService.getOneActive(user.id);

    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus.replace("_", " ");

    const payload = buildTaskDetail(task, {
      hasActiveSession: !!session,
      notification: `✅ Status updated to **${statusLabel}**`,
    });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Status change error:", err);

    if (err.code === "INVALID_STATUS") {
      return interaction.editReply(buildV2Message("⚠️ Invalid status.", { type: "warning" }));
    }
    await interaction.editReply(buildV2Message("Something went wrong updating status."));
  }
}

async function handleStartWorking(interaction) {
  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  const modal = new ModalBuilder()
    .setCustomId(`tasks:start_working_modal:${taskId}`)
    .setTitle("Start Working");

  const durationInput = new TextInputBuilder()
    .setCustomId("duration")
    .setLabel(`Session duration (${MIN_SESSION_MINUTES}-${MAX_SESSION_MINUTES} min)`)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder(`defaults to ${DEFAULT_SESSION_MINUTES} minutes`);

  modal.addComponents(new ActionRowBuilder().addComponents(durationInput));

  await interaction.showModal(modal);
}

async function handleSwitchToTask(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const task = await taskService.getById(taskId, user.id, { includeProject: true });
    if (!task) {
      return interaction.editReply(buildV2Message("Task not found.", { type: "warning" }));
    }

    const activeSession = await sessionService.getOneActive(user.id);
    if (!activeSession) {
      const payload = buildTaskDetail(task, {
        hasActiveSession: false,
        currentTaskId: null,
        notification: "You're not clocked in.",
      });
      return interaction.editReply(payload);
    }

    const currentSessionTask = await taskService.getCurrentTaskForSession(activeSession.id);
    const currentTaskId = currentSessionTask?.id ?? null;

    if (currentTaskId != null && String(currentTaskId) === String(task.id)) {
      const payload = buildTaskDetail(task, {
        hasActiveSession: true,
        currentTaskId,
        notification: "You're already working on this task.",
      });
      return interaction.editReply(payload);
    }

    const sessionTask = await taskService.linkToActiveSession(user.id, task.id);
    if (!sessionTask) {
      const payload = buildTaskDetail(task, {
        hasActiveSession: true,
        currentTaskId,
        notification: "Couldn't switch to that task.",
      });
      return interaction.editReply(payload);
    }

    const activity = task.project?.name ? `[${task.project.name}] ${task.title}` : task.title;
    await sessionService.updateActivity(user.id, activity);

    if (task.status === TASK_STATUS.TODO) {
      await taskService.updateStatus(task.id, user.id, TASK_STATUS.IN_PROGRESS);
      task.status = TASK_STATUS.IN_PROGRESS;
    }

    const payload = buildTaskDetail(task, {
      hasActiveSession: true,
      currentTaskId: task.id,
      notification: "✅ Now working on this task!",
    });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Switch task error:", err);
    await interaction.editReply(buildV2Message("Something went wrong switching tasks."));
  }
}

async function handleEditButton(interaction) {
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

async function handleArchiveButton(interaction) {
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

async function handleDeleteButton(interaction) {
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

async function handleBackToDetail(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const task = await taskService.getById(taskId, user.id, { includeProject: true });

    if (!task) {
      return interaction.editReply(buildV2Message("⚠️ Task not found.", { type: "warning" }));
    }

    const context = await getTaskDetailContext(taskService, sessionService, user.id);
    const payload = buildTaskDetail(task, context);

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Back to detail error:", err);
    await interaction.editReply(buildV2Message("Failed to load task details."));
  }
}

export async function handleTaskButtons(interaction) {
  const parts = interaction.customId.split(":");
  const action = parts[1];

  switch (action) {
    case "new":
      return handleNewTaskButton(interaction);
    case "back":
      return handleBackButton(interaction);
    case "status":
      return handleStatusChange(interaction);
    case "start_working":
      return handleStartWorking(interaction);
    case "switch_to":
      return handleSwitchToTask(interaction);
    case "edit":
      return handleEditButton(interaction);
    case "archive":
      return handleArchiveButton(interaction);
    case "delete":
      return handleDeleteButton(interaction);
    case "delete_confirm":
      return handleDeleteConfirm(interaction);
    case "back_to_detail":
      return handleBackToDetail(interaction);
    default:
      console.warn(`[Task Dashboard] Unknown button action: ${action}`);
  }
}
