import { Client, GatewayIntentBits, Collection } from "discord.js";
import addCommands from "./utils/addCommands.js";
import addEvents from "./utils/addEvents.js";
import { required } from "./utils/envHelpers.js";
// import { required, parseIds } from "./utils/envHelpers.js";
import addJobs from "./utils/addJobs.js";
import { adminDb } from "./models/index.js";

// ---- Read ENV ----
const TOKEN = required("token");
// const STATUS_CHANNEL_ID = required("statusChannelId");
// const SUMMARY_CHANNEL_ID = required("chatSummaryChannelId");
// const SOURCE_CHANNEL_IDS = parseIds(required("sourceChannelIds"));
// Optional (used by aiSummary.js likely)
// const OLLAMA_URL = process.env.ollamaUrl;
// const OLLAMA_MODEL = process.env.ollamaModel;

// --- Client Setup ----
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// ---- Database Initialization (Phase 1: Sync) ----
console.log("Initializing database...");
await adminDb.sequelize.authenticate();
console.log("✓ Database connected.");

if (process.env.NODE_ENV !== "production") {
  await adminDb.sequelize.sync({ alter: true });
  console.log("✓ Database synced.");
}

// Load commands, events & add cron jobs
console.log("Loading bot components...");
await addCommands(client);
await addEvents(client);
await addJobs(client);

// Log in bot
await client.login(TOKEN);
console.log("✓ Bot is online.");
