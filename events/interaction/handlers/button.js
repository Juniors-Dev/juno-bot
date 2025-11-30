import { handleCreateUserButton } from "../features/users/create-user-modal.js";
import { handleTimerButtons } from "../features/sessions/handle-timer-buttons.js";
import { handleProjectCreateModal } from "../features/projectHelper/project-create-modal-handler.js";
import { projectCreateModal } from "../features/projectHelper/project-create-modal.js";
import { projectEditModal } from "../features/projectHelper/project-edit-modal.js";

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
  project_edit: {
    run: projectEditModal,
    context: { needsUser: true, needsSession: false },
  },
};
