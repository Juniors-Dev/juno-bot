import { handleCreateUserModal } from "../features/users/handle-user-modal.js";
import { handleProjectCreateModal } from "../features/projectHelper/project-create-modal-handler.js";
import { handleClockInModals } from "../features/sessions/handle-clock-in-interactions.js";

export const modalSubmitHandlers = {
  create_user_modal: {
    run: handleCreateUserModal,
    context: { needsUser: true, needsSession: false },
  },
  create_project_modal: {
    run: handleProjectCreateModal,
    context: { needsUser: true, needsSession: false },
  },
  clock_in: {
    run: handleClockInModals,
    context: { needsUser: true, needsSession: false },
  },
};
