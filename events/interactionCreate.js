import { Events } from "discord.js";
import { handleChatInputCommand } from "./handlers/command.js";
import { handleButton } from "./handlers/button.js";
import { handleModalSubmit } from "./handlers/modal.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleButton(interaction);
        return;
      }

      if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
        return;
      }
    } catch (error) {
      console.error("[InteractionCreate] Unhandled error:", error);
    }
  },
};
