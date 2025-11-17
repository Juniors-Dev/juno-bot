# juno-bot

An organizational bot for our discord.

# Juno-bot

A Discord bot for Juniors.dev that handles time management,task management, project management, and other organizational features potentially leveraging AI for summarization and insights in later versions.

## Features

-

## Setup

### 1. Clone the repository

```sh
git clone https://github.com/Juniors-Dev/juno-bot.git
cd Juno-bot
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure the bot

Create a `.env` file in the root directory using the provided `.env.example` as a template:

```.env
# Discord
token= ""
statusChannelId= ""
chatSummaryChannelId= ""
clientId= ""
guildId= ""
sourceChannelIds= []

#AI
ollamaUrl= "https://juno-ollama.fly.dev"
ollamaModel= "tinyllama"

# Database
HOST=localhost
DATABASE_NAME=juno_time_dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret
DIALECT=postgres
CRUD_USERNAME=crud_user
CRUD_PASSWORD=crud_password
SSL = false
```

**Never commit your real token to version control!**

### 4. Enable Message Content Intent

- In the [Discord Developer Portal](https://discord.com/developers/applications), go to your bot's settings.
- Under "Privileged Gateway Intents", enable **Message Content Intent**.
- Make sure your bot code includes `GatewayIntentBits.MessageContent` (already set in `index.js`).

### 5. Set up the database

You can setup a PostgreSQL database locally or hosted, but a docker compose setup is provided for convenience. Open docker desktop then run the following command in the project root:

```sh
docker-compose up -d
```

### 6. Run the bot

```sh
npm run start
# or for development:
npm run dev
```

## Deploying Slash Commands

Whenever you add or modify slash commands in the `commands/` directory, you need to deploy them to Discord:

```sh
node deploy-commands.js
```

This will register (or update) all slash commands for your guild.

## Usage

TODO: Add usage instructions for commands and features once finalized.

## Troubleshooting

TODO: Add common issues and solutions.

## Development

- Commands are in `commands/`
- AI logic is in `utils/aiSummary.js`
- Scheduled tasks and main logic are in `index.js`

## License

ISC
