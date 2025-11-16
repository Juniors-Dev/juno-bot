import { Events } from "discord.js";
import { handleEvent } from "./handleEvent.js";
import { handleChatInputCommand } from "./command.js";
import { buttonHandlers } from "./button.js";
import { modalSubmitHandlers } from "./modal.js";
import { selectHandlers } from "./select.js";
import { triggers } from "../message/triggers.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleEvent(interaction, buttonHandlers);
        return;
      }

      if (interaction.isModalSubmit()) {
        await handleEvent(interaction, modalSubmitHandlers);
        return;
      }

      if (interaction.isAnySelectMenu()) {
        await handleEvent(interaction, selectHandlers);
        return;
      }

      for (const trigger of triggers) {
        if (trigger.match(interaction)) {
          await trigger.run(interaction);
          return;
        }
      }
    } catch (error) {
      console.error("[InteractionCreate] Unhandled error:", error);
    }
  },
};
