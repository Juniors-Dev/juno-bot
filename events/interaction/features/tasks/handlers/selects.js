import { setState, refreshDashboard } from "../task-dashboard-state.js";
import { buildTaskDashboard, buildTaskDetail, buildV2Message } from "../task-dashboard-ui.js";
import { getTaskDetailContext } from "../task-dashboard-helpers.js";

async function handleFilterSelect(interaction) {
  const newFilter = interaction.values[0];
  setState(interaction.user.id, { filter: newFilter, selectedTaskId: null });

  await interaction.deferUpdate();

  try {
    const { filter, tasks } = await refreshDashboard(interaction);

    const payload = buildTaskDashboard(tasks, { filter });

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Filter error:", err);
    await interaction.editReply(buildV2Message("Something went wrong filtering tasks."));
  }
}

async function handleTaskSelect(interaction) {
  const { user } = interaction.botContext;
  const { taskService, sessionService } = interaction.services;

  const taskId = parseInt(interaction.values[0], 10);
  setState(interaction.user.id, { selectedTaskId: taskId });

  await interaction.deferUpdate();

  try {
    const task = await taskService.getById(taskId, user.id, { includeProject: true });

    if (!task) {
      return interaction.editReply(
        buildV2Message("⚠️ Task not found. It may have been deleted.", { type: "warning" }),
      );
    }

    const context = await getTaskDetailContext(taskService, sessionService, user.id);
    const payload = buildTaskDetail(task, context);

    await interaction.editReply(payload);
  } catch (err) {
    console.error("[Task Dashboard] Select error:", err);
    await interaction.editReply(buildV2Message("Something went wrong loading task details."));
  }
}

//--- Router ----
export async function handleTaskSelects(interaction) {
  const [, action] = interaction.customId.split(":");

  switch (action) {
    case "filter":
      return handleFilterSelect(interaction);
    case "select":
      return handleTaskSelect(interaction);
    default:
      console.warn(`[Task Dashboard] Unknown select action: ${action}`);
  }
}
