/**
 * In-memory state storage
 * Map<userId, { filter: string, selectedTaskId: number|null }>
 */
const dashboardState = new Map();
const dashboardStateTimeouts = new Map();

const STATE_TTL_MS = 10 * 60 * 1000;

export function getState(userId) {
  return dashboardState.get(userId) ?? { filter: "active", selectedTaskId: null };
}

/**
 * Update user's dashboard state
 * Merges updates with existing state and resets TTL
 * @param {string} userId - Discord user ID
 * @param {Object} updates - State updates to merge
 */
export function setState(userId, updates) {
  const current = getState(userId);
  dashboardState.set(userId, { ...current, ...updates });

  const existingTimeout = dashboardStateTimeouts.get(userId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const timeout = setTimeout(() => {
    dashboardState.delete(userId);
    dashboardStateTimeouts.delete(userId);
  }, STATE_TTL_MS);

  dashboardStateTimeouts.set(userId, timeout);
}

export function clearState(userId) {
  dashboardState.delete(userId);
  const existingTimeout = dashboardStateTimeouts.get(userId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    dashboardStateTimeouts.delete(userId);
  }
}

/**
 * Fetch tasks based on filter value
 * @param {Object} taskService - TaskService instance
 * @param {string} userId - Internal user UUID
 * @param {string} filter - Filter value (active, todo, in_progress, done, all)
 * @returns {Promise<Array>} Filtered tasks with project info
 */
export async function fetchFilteredTasks(taskService, userId, filter) {
  const filterMap = {
    active: ["todo", "in_progress"],
    todo: "todo",
    in_progress: "in_progress",
    done: "done",
    all: null,
  };

  const status = filter in filterMap ? filterMap[filter] : ["todo", "in_progress"];

  const tasks = await taskService.getByUser(userId, {
    status,
    includeProject: true,
  });

  return tasks;
}

export async function refreshDashboard(interaction) {
  const { user } = interaction.botContext;
  const { taskService } = interaction.services;

  const state = getState(interaction.user.id);
  const tasks = await fetchFilteredTasks(taskService, user.id, state.filter);

  return {
    filter: state.filter,
    tasks,
  };
}
