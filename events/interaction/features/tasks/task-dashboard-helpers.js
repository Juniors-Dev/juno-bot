/**
 * @desc Fetch session + current task context for task detail views.
 * @param {Object} taskService - TaskService instance
 * @param {Object} sessionService - SessionService instance
 * @param {string} internalUserId - Internal user UUID
 * @returns {Promise<{hasActiveSession: boolean, currentTaskId: number|null}>}
 */
export async function getTaskDetailContext(taskService, sessionService, internalUserId) {
  const activeSession = await sessionService.getOneActive(internalUserId);

  if (!activeSession) {
    return { hasActiveSession: false, currentTaskId: null };
  }

  const currentTask = await taskService.getCurrentTaskForSession(activeSession.id);

  return {
    hasActiveSession: true,
    currentTaskId: currentTask?.id ?? null,
  };
}
