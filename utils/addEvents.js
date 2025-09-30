import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addEvents = async (client) => {
  const eventFiles = fs.readdirSync(path.join(__dirname, "./events"));
  for (const file of eventFiles) {
    const event = await import(`./events/${file}`);
    const eventModule = event.default ?? event;
    if (!eventModule.name || typeof eventModule.execute !== "function") {
      console.warn(`Skipped event ${file}: missing name/execute`);
      continue;
    }
    if (eventModule.once)
      client.once(eventModule.name, (...args) => eventModule.execute(...args, client));
    else client.on(eventModule.name, (...args) => eventModule.execute(...args, client));
  }
};

export default addEvents;
