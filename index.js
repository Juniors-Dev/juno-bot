const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { summarizeMessages } = require("./utils/aiSummary");
const fs = require("fs");
const config = require("./config.json");
const cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Load events
const eventFiles = fs.readdirSync("./events");
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once)
    client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

// Log in bot
client.login(config.token);

// On ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Good morning at 09:00
  cron.schedule(
    "0 9 * * *",
    () => {
      const channel = client.channels.cache.get(config.statusChannelId);
      if (channel) {
        channel.send(`☀️ Good morning Juniors! Let's have a productive day!`);
      }
    },
    { timezone: "Europe/Oslo" }
  );

  // Good night at 22:00
  cron.schedule(
    "0 22 * * *",
    () => {
      const channel = client.channels.cache.get(config.statusChannelId);
      if (channel) {
        channel.send(`🌙 Good night team. Great work today!`);
      }
    },
    { timezone: "Europe/Oslo" }
  );
  const sourceChannelIds = config.sourceChannelIds;

  cron.schedule(
    "0 18 * * 0",
    async () => {
      const summaryChannel = client.channels.cache.get(
        config.chatSummaryChannelId
      );
      if (!summaryChannel) return;

      let allMessages = [];

      for (const id of sourceChannelIds) {
        const channel = client.channels.cache.get(id);
        if (!channel) continue;

        const fetched = await channel.messages.fetch({ limit: 100 });
        allMessages = allMessages.concat([...fetched.values()]);
      }

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const recentMessages = allMessages
        .filter(
          (msg) =>
            !msg.author.bot &&
            msg.createdTimestamp > oneWeekAgo &&
            msg.content.length > 5
        )
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .slice(-100); // You can adjust this number as needed

      // Create a mock interaction for the summarizeMessages function
      const mockInteraction = {
        editReply: async (message) => {
          console.log("📝 Weekly summary progress:", message);
        }
      };

      const summary = await summarizeMessages(recentMessages, mockInteraction);
      summaryChannel.send(`🧠 **Weekly AI Summary**\n${summary}`);
    },
    { timezone: "Europe/Oslo" }
  );
});
