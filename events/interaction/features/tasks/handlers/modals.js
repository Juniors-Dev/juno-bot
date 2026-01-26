import { MessageFlags } from "discord.js";
import { refreshDashboard, clearState } from "../task-dashboard-state.js";
import { buildTaskDashboard, buildTaskDetail, buildV2Message } from "../task-dashboard-ui.js";
import { getTaskDetailContext } from "../task-dashboard-helpers.js";
import { buildClockInMessagePayload } from "../../../../../features/session/messageBuilder.js";
import { startTimer } from "../../../../../features/session/timerManager.js";
import { TASK_STATUS } from "../../../../../services/TaskService.js";
import {
  DEFAULT_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
} from "../../../../../features/session/constants.js";

async function handleNewTaskModal(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  await interaction.deferUpdate();

  try {
    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description") || null;

    await taskService.create(user.id, {
      title,
      description,
      status: TASK_STATUS.TODO,
    });

    const { filter, tasks } = await refreshDashboard(interaction);

    const payload = buildTaskDashboard(tasks, {
      filter,
      notification: `✅ Task created: **${title}**`,
    });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] New task error:", err);
    await interaction.editReply(buildV2Message("Something went wrong creating your task."));
  }
}

async function handleEditModal(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);

  await interaction.deferUpdate();

  try {
    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description") || null;

    const updatedTask = await taskService.update(taskId, user.id, {
      title,
      description,
    });

    if (!updatedTask) {
      return interaction.editReply(
        buildV2Message("⚠️ Task not found or could not be updated.", { type: "warning" }),
      );
    }

    const task = await taskService.getById(taskId, user.id, { includeProject: true });
    const context = await getTaskDetailContext(taskService, sessionService, user.id);

    const payload = buildTaskDetail(task, {
      ...context,
      notification: "✅ Task updated!",
    });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Edit modal error:", err);
    await interaction.editReply(buildV2Message("Something went wrong updating your task."));
  }
}

async function handleStartWorkingModal(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const taskId = parseInt(interaction.customId.split(":")[2], 10);
  const durationInput = interaction.fields.getTextInputValue("duration")?.trim();

  let duration = DEFAULT_SESSION_MINUTES;
  if (durationInput) {
    const parsed = parseInt(durationInput, 10);
    if (!isNaN(parsed)) {
      duration = Math.max(MIN_SESSION_MINUTES, Math.min(parsed, MAX_SESSION_MINUTES));
    }
  }

  await interaction.deferUpdate();

  try {
    const task = await taskService.getById(taskId, user.id, { includeProject: true });

    if (!task) {
      return interaction.editReply(buildV2Message("Task not found.", { type: "warning" }));
    }

    const activity = task.project?.name ? `[${task.project.name}] ${task.title}` : task.title;

    const session = await sessionService.start(user.id, {
      activity,
      targetDurationMinutes: duration,
    });

    if (!session) {
      return interaction.editReply(
        buildV2Message("You're already clocked in.", { type: "warning" }),
      );
    }

    await taskService.linkToActiveSession(user.id, task.id);

    if (task.status === TASK_STATUS.TODO) {
      await taskService.updateStatus(task.id, user.id, TASK_STATUS.IN_PROGRESS);
    }

    startTimer(interaction.client, session, duration);
    clearState(interaction.user.id);

    await interaction.editReply(
      buildV2Message("✅ Session started from this task. You'll get a warning DM before it ends.", {
        type: "info",
      }),
    );

    const clockInPayload = buildClockInMessagePayload({
      session,
      targetDurationMinutes: duration,
      activity,
    });

    await interaction.followUp({ ...clockInPayload, flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error("[Task Dashboard] Start working modal error:", err);
    await interaction.editReply(buildV2Message("Something went wrong starting your session."));
  }
}

export async function handleTaskModals(interaction) {
  const parts = interaction.customId.split(":");
  const action = parts[1];

  switch (action) {
    case "new_modal":
      return handleNewTaskModal(interaction);
    case "edit_modal":
      return handleEditModal(interaction);
    case "start_working_modal":
      return handleStartWorkingModal(interaction);
    default:
      console.warn(`[Task Dashboard] Unknown modal action: ${action}`);
  }
}
