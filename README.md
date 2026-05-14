# juno-bot

An organizational bot for our discord.

# Juno-bot

A Discord bot for Juniors.dev that summarizes chat activity using AI (TinyLlama via Ollama on Fly.io), manages daily status, and more.

## Features

- **AI Summarization**: Summarizes large amounts of chat using chunked requests to an Ollama AI server.
- **Daily Scheduler**: Posts good morning and good night messages automatically.
- **Slash Commands**: Includes `/summarize-channel`, `/status`, `/note`, `/todo`, and more.

## Setup

### 1. Clone the repository

```sh
git clone https://github.com/johnDavid97/Juno-bot.git
cd Juno-bot
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Configure the bot

Edit `config.json` with your Discord bot credentials and channel IDs:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "statusChannelId": "DISCORD_CHANNEL_ID_FOR_STATUS",
  "chatSummaryChannelId": "DISCORD_CHANNEL_ID_FOR_SUMMARIES",
  "clientId": "YOUR_BOT_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "sourceChannelIds": ["CHANNEL_ID_1", "CHANNEL_ID_2"],
  "ollamaUrl": "https://your-ollama-instance.fly.dev",
  "ollamaModel": "tinyllama"
}
```

**Never commit your real token to version control!**

### 4. Enable Message Content Intent

- In the [Discord Developer Portal](https://discord.com/developers/applications), go to your bot's settings.
- Under "Privileged Gateway Intents", enable **Message Content Intent**.
- Make sure your bot code includes `GatewayIntentBits.MessageContent` (already set in `index.js`).

### 5. Run the bot

```sh
node index.js
```

## Deploying Slash Commands

Whenever you add or modify slash commands in the `commands/` directory, you need to deploy them to Discord:

```sh
node deploy-commands.js.js
```

This will register (or update) all slash commands for your guild.

## Usage

- Use `/summarize-channel` to summarize a channel's recent messages. The bot will handle large histories by chunking and combining summaries.
- Other commands: `/status`, `/note`, `/todo`, etc.

## Troubleshooting

- **Bot can't read messages?**
  Ensure the "Message Content Intent" is enabled in both the Discord Developer Portal and your code.
- **Summarization times out or fails?**
  This can happen if the Ollama server is cold-starting or overloaded. Try again, or adjust your Fly.io auto-stop settings to reduce cold starts.
- **Token/context limits?**
  The bot automatically chunks large message histories to fit within AI model limits.

## Development

- Commands are in `commands/`
- AI logic is in `utils/aiSummary.js`
- Scheduled tasks and main logic are in `index.js`

## License

ISC
