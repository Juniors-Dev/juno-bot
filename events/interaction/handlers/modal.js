import { handleCreateUserModal } from "../features/users/handle-user-modal.js";
import { handleProjectCreateModal } from "../features/projectHelper/project-create-modal-handler.js";
import { handleProjectLinkCreateModal } from "../features/projectHelper/links/project-link-create-modal-handler.js";

export const modalSubmitHandlers = {
  create_user_modal: {
    run: handleCreateUserModal,
    context: { needsUser: true, needsSession: false },
  },
  create_project_modal: {
    run: handleProjectCreateModal,
    context: { needsUser: true, needsSession: false },
  },
  create_project_link_modal: {
    run: handleProjectLinkCreateModal,
    context: { needsUser: true, needsSession: false },
  },
};
