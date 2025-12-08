import { refreshDashboard } from "../task-dashboard-state.js";
import { buildTaskDashboard, buildTaskDetail, buildV2Message } from "../task-dashboard-ui.js";

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
      status: "todo",
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
    const session = await sessionService.getOneActive(user.id);

    const payload = buildTaskDetail(task, {
      hasActiveSession: !!session,
      notification: "✅ Task updated!",
    });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Edit modal error:", err);
    await interaction.editReply(buildV2Message("Something went wrong updating your task."));
  }
}

//--- Router ----
export async function handleTaskModals(interaction) {
  const parts = interaction.customId.split(":");
  const action = parts[1];

  switch (action) {
    case "new_modal":
      return handleNewTaskModal(interaction);
    case "edit_modal":
      return handleEditModal(interaction);
    default:
      console.warn(`[Task Dashboard] Unknown modal action: ${action}`);
  }
}
