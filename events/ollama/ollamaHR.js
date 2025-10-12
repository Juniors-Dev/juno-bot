import "dotenv/config";
import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    const triggerWords = ["hr", "HR", "hR", "Hr", "hr!", "HR!"];
    const contextPrompt =
      "When someone writes 'hr', respond in a dramatically over-serious mock corporate tone, pretending to file a fake HR complaint for comic effect. Stay absurdly bureaucratic, but never threaten or insult anyone. MESSAGE CONTENT: ";
    if (message.author.bot) {
      return;
    }
    for (const word of triggerWords) {
      if (message.content.includes(word)) {
        try {
          const response = await fetch(
            `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || "llama3",
                prompt: contextPrompt + message.content,
                stream: false,
              }),
            },
          );

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          const MAX_LENGTH = 2000;
          const reply = data.response || "No response.";

          for (let i = 0; i < reply.length; i += MAX_LENGTH) {
            const chunk = reply.slice(i, i + MAX_LENGTH);
            await message.channel.send(chunk);
          }

          // Ollama returns text as `response` field
          //await message.channel.send(data.response || "No response from model.");
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
