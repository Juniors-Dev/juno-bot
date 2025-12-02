import { handleCreateUserButton } from "../features/users/create-user-modal.js";
import { handleTimerButtons } from "../features/sessions/handle-timer-buttons.js";
import { projectCreateModal } from "../features/projectHelper/project-create-modal.js";
import { projectDeleteConfirmation } from "../features/projectHelper/project-delete.js";
import { projectDeleteCancelHandler } from "../features/projectHelper/project-cancel-delete-handler.js";
import { projectDeleteConfirmHandler } from "../features/projectHelper/project-confirm-delete-handler.js";
import { projectCreateLinkModal } from "../features/projectHelper/links/project-link-create-modal.js";
import { projectLinkManager } from "../features/projectHelper/links/project-links.js";

export const buttonHandlers = {
  create_user_modal_button: {
    run: handleCreateUserButton,
    context: { needsUser: true, needsSession: false },
  },
  timer: {
    run: handleTimerButtons,
    context: { needsUser: true, needsSession: false },
  },
  project_create: {
    run: projectCreateModal,
    context: { needsUser: true, needsSession: false },
  },
  project_links: {
    run: projectLinkManager,
    context: { needsUser: true, needsSession: false },
  },
  project_link_create: {
    run: projectCreateLinkModal,
    context: { needsUser: true, needsSession: false },
  },
  project_delete: {
    run: projectDeleteConfirmation,
    context: { needsUser: true, needsSession: false },
  },
  cancel_project_delete: {
    run: projectDeleteCancelHandler,
    context: { needsUser: true, needsSession: false },
  },
  confirm_project_delete: {
    run: projectDeleteConfirmHandler,
    context: { needsUser: true, needsSession: false },
  },
};
