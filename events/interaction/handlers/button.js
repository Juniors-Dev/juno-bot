import { handleCreateUserButton } from "../features/users/create-user-modal.js";

export const buttonHandlers = {
  create_user_modal_button: {
    run: handleCreateUserButton,
    context: { needsUser: true, needsSession: false },
  },
};
