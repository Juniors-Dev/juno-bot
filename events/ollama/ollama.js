import "dotenv/config";
import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    const triggerWords = ["troll bot", "TROLL BOT", "Bot", "bot", "BOT", "Troll Bot", "Troll bot"];
    console.log(message);
    for (const word of triggerWords) {
      if (message.content.startsWith(word)) {
        try {
          const response = await fetch(
            `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || "llama3",
                prompt: message.content,
                stream: false,
              }),
            },
          );

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();

          // Ollama returns text as `response` field
          await message.channel.send(data.response || "No response from model.");
        } catch (err) {
          await message.channel.send(
            `An error occurred while trying to generate a response: ${err.message}`,
          );
        }

        break; // stop checking once a match triggers
      }
    }
  },
};
