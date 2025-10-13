import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: true,
  execute(message) {
    const triggerWords = {
      imDad: ["I'm ", "Im ", "im ", "i'm "],
      shutUp: ["poke", "prod"],
    };

    for (const word of triggerWords.imDad) {
      if (message.content.startsWith(word)) {
        const split = message.content.split(" ");
        const name = split[1] ? split[1].charAt(0).toUpperCase() + split[1].slice(1) : "stranger";
        message.reply(`Hi, ${name}. I'm Troll Bot!`);
        break;
      }
    }
  },
};
