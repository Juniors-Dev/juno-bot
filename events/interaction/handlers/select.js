import { projectSelectHandler } from "../features/projectHelper/project-select-menu-handler.js";
import { linkProjectSelectHandler } from "../features/projectHelper/links/link-project-select-menu-handler.js";
import { projectLinkSelectHandler } from "../features/projectHelper/links/link-select-menu-handler.js";
export const selectHandlers = {
  project_select: {
    run: projectSelectHandler,
    context: { needsUser: true, needsSession: false },
  },
  link_project_select: {
    run: linkProjectSelectHandler,
    context: { needsUser: true, needsSession: false },
  },
  project_links_select: {
    run: projectLinkSelectHandler,
    context: { needsUser: true, needsSession: false },
  },
};
