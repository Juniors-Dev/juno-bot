import { handleCreateUserModal } from "../users/handle-user-modal.js";

export async function handleModalSubmit(interaction) {
  const { customId } = interaction;

  try {
    if (customId === "create_user_modal") {
      return handleCreateUserModal(interaction);
    }
    //add more modal handlers here (e.g. clock_in_modal).

    console.warn(`⚠️ Unhandled modal submit: ${customId}`);
  } catch (error) {
    console.error(`Modal handler error (${customId}):`, error);
  }
}
