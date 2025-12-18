import { TASK_STATUS } from "../../../../services/TaskService.js";

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

const FILTER_TO_STATUS_MAP = {
  active: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.TODO]: TASK_STATUS.TODO,
  [TASK_STATUS.IN_PROGRESS]: TASK_STATUS.IN_PROGRESS,
  [TASK_STATUS.DONE]: TASK_STATUS.DONE,
  all: null,
};

const DEFAULT_FILTER_STATUS = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS];

function getStatusForFilter(filter) {
  return filter in FILTER_TO_STATUS_MAP ? FILTER_TO_STATUS_MAP[filter] : DEFAULT_FILTER_STATUS;
}

/**
 * Fetch tasks based on filter value
 * @param {Object} taskService - TaskService instance
 * @param {string} userId - Internal user UUID
 * @param {string} filter - Filter value (active, todo, in_progress, done, all)
 * @returns {Promise<Array>} Filtered tasks
 */
export async function fetchFilteredTasks(taskService, userId, filter) {
  return taskService.getByUser(userId, {
    status: getStatusForFilter(filter),
    includeProject: true,
  });
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
