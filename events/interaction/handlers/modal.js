import { handleCreateUserModal } from "../features/users/handle-user-modal.js";
import { handleClockInModal } from "../features/sessions/handle-clock-in-modal.js";

export const modalSubmitHandlers = {
  create_user_modal: {
    run: handleCreateUserModal,
    context: { needsUser: true, needsSession: false },
  },
  clock_in_modal: {
    run: handleClockInModal,
    context: { needsUser: true, needsSession: false },
  },
};
