import { handleCreateUserButton } from "../features/users/create-user-modal.js";
import { handleTimerButtons } from "../features/sessions/handle-timer-buttons.js";

export const buttonHandlers = {
  create_user_modal_button: {
    run: handleCreateUserButton,
    context: { needsUser: true, needsSession: false },
  },
  timer: {
    run: handleTimerButtons,
    context: { needsUser: true, needsSession: false },
  },
};
