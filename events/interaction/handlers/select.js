import { handleTaskSelects } from "../features/tasks/handlers/index.js";

export const selectHandlers = {
  tasks: {
    run: handleTaskSelects,
    context: { needsUser: true, needsSession: false },
  },
};
