import { handleCreateUserButton } from "../features/users/create-user-modal.js";
import { handleClockInButton } from "../features/sessions/handle-clock-in-button.js";
import { handleClockOutButton } from "../features/sessions/handle-clock-out-button.js";
import { handleTimerButtons } from "../features/sessions/handle-timer-buttons.js";
import { handleProjectCreateModal } from "../features/projectHelper/project-create-modal-handler.js";
import { projectCreateModal } from "../features/projectHelper/project-create-modal.js";
import { handleTaskButtons } from "../features/tasks/handlers/index.js";

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
  tasks: {
    run: handleTaskButtons,
    context: { needsUser: true, needsSession: false },
  },
};
