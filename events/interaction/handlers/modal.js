import { handleCreateUserModal } from "../features/users/handle-user-modal.js";
import { handleProjectCreateModal } from "../features/projectHelper/project-create-modal-handler.js";
import { handleClockInModal } from "../features/sessions/handle-clock-in-modal.js";
import { handleTaskModals } from "../features/tasks/handlers/index.js";

export const modalSubmitHandlers = {
  create_user_modal: {
    run: handleCreateUserModal,
    context: { needsUser: true, needsSession: false },
  },
  create_project_modal: {
    run: handleProjectCreateModal,
    context: { needsUser: true, needsSession: false },
  },
  clock_in_modal: {
    run: handleClockInModal,
    context: { needsUser: true, needsSession: false },
  },
  tasks: {
    run: handleTaskModals,
    context: { needsUser: true, needsSession: false },
  },
};
