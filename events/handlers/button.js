import { handleCreateUserButton } from "../users/create-user-modal.js";

export async function handleButton(interaction) {
  const { customId } = interaction;

  try {
    if (customId === "create_user_modal_button") {
      return handleCreateUserButton(interaction);
    }
    //add more button handlers here (e.g. session punch and timer buttons).

    console.warn(`⚠️ Unhandled button interaction: ${customId}`);
  } catch (error) {
    console.error(`Button handler error (${customId}):`, error);
  }
}
