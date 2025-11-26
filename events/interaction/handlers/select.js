import { projectSelectHandler } from "../features/projectHelper/project-select-menu-handler.js";

export const selectHandlers = {
  project_select: {
    run: projectSelectHandler,
    context: { needsUser: true, needsSession: false },
  },
};
