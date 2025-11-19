import { handleCreateUserButton } from "../features/users/create-user-modal.js";
import { handleClockInButton } from "../features/sessions/handle-clock-in-button.js";
import { handleClockOutButton } from "../features/sessions/handle-clock-out-button.js";
import { handleTimerButtons } from "../features/sessions/handle-timer-buttons.js";

export const buttonHandlers = {
  create_user_modal_button: {
    run: handleCreateUserButton,
    context: { needsUser: true, needsSession: false },
  },
  clock_in_button: {
    run: handleClockInButton,
    context: { needsUser: true, needsSession: false },
  },
  clock_out_button: {
    run: handleClockOutButton,
    context: { needsUser: true, needsSession: true },
  },
  timer: {
    run: handleTimerButtons,
    context: { needsUser: true, needsSession: false },
  },
};
