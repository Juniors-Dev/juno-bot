import { projectSelectHandler } from "../features/projectHelper/project-select-menu-handler.js";
import { handleClockInSelects } from "../features/sessions/handle-clock-in-interactions.js";
import { handleTaskSelects } from "../features/tasks/handlers/index.js";

export const selectHandlers = {
  project_select: {
    run: projectSelectHandler,
    context: { needsUser: true, needsSession: false },
  },
  clock_in: {
    run: handleClockInSelects,
    context: { needsUser: true, needsSession: false },
  },
   tasks: {
    run: handleTaskSelects,
    context: { needsUser: true, needsSession: false },
  },
};
