# juno-bot

A Discord bot for Juniors.dev that provides time-tracking, project management, task management, and a live server dashboard. Members clock in and out of work sessions, attach tasks and projects to those sessions, and see real-time activity on a shared channel dashboard.

---

## Features

- **Session tracking** — clock in to start a timed work session, clock out to end it; sessions record activity text, duration, and linked tasks
- **Session timers** — configurable warn-before and grace-period windows; the bot DMs a warning before the target duration expires and auto-ends the session after the grace period; timers survive bot restarts
- **Live dashboard** — a persistent channel message showing who is currently clocked in and a daily leaderboard of total time worked; updates on a throttled trailing-edge schedule with a configurable idle refresh interval
- **Personal dashboard** — `/my-dashboard` shows per-user monthly stats: total time, session count, average session length, longest session, best day, and active-day streak
- **Task management** — create, update, archive, and delete tasks; filter by status; tasks can be linked to projects and attached to the active session at clock-in
- **Project management** — create, edit, archive, restore, and delete projects; role-based membership with admin and link-add permissions; attach categorised links (GitHub, Figma, docs, etc.) to each project

---

## Prerequisites

- Node.js 22 or later
- pnpm
- Docker and Docker Compose (for the local PostgreSQL database)
- A Discord application with a bot token and a target guild

---

## Installation

```sh
git clone https://github.com/Juniors-Dev/juno-bot.git
cd juno-bot
pnpm install
```

---

## Database setup

Start a local PostgreSQL 15 instance using the provided compose file:

```sh
docker-compose up -d
```

This creates a container named `pg_juno_dev` on port `5432` with the following defaults:

| Setting       | Default value   |
| ------------- | --------------- |
| User          | `admin`         |
| Password      | `secret`        |
| Database name | `juno_time_dev` |

Data is persisted in a Docker volume named `pg_data`.

In development mode the bot runs `sequelize.sync({ alter: true })` on startup, so tables are created and migrated automatically. In production (`NODE_ENV=production`) the sync step is skipped.

---

## Environment variables

Copy the example file and fill in the values before starting the bot:

```sh
cp ".env .example" .env
```

| Variable                  | Required | Description                                                           | Example              |
| ------------------------- | -------- | --------------------------------------------------------------------- | -------------------- |
| `NODE_ENV`                | No       | Set to `production` to skip DB sync on startup                        | `development`        |
| `token`                   | Yes      | Discord bot token                                                     | `MTIz...`            |
| `clientId`                | Yes      | Discord application client ID (used by `deploy-commands.js`)          | `123456789012345678` |
| `guildId`                 | Yes      | Target guild (server) ID                                              | `987654321098765432` |
| `statusChannelId`         | No       | Channel where the good morning cron job posts                         | `111222333444555666` |
| `HOST`                    | Yes      | PostgreSQL host                                                       | `localhost`          |
| `DATABASE_NAME`           | Yes      | PostgreSQL database name                                              | `juno_time_dev`      |
| `ADMIN_USERNAME`          | Yes      | PostgreSQL username                                                   | `admin`              |
| `ADMIN_PASSWORD`          | Yes      | PostgreSQL password                                                   | `secret`             |
| `DIALECT`                 | Yes      | Sequelize dialect (must be `postgres`)                                | `postgres`           |
| `DEFAULT_SESSION_MINUTES` | No       | Default session target duration in minutes (default: `120`)           | `120`                |
| `MIN_SESSION_MINUTES`     | No       | Minimum session length in minutes (default: `10`)                     | `10`                 |
| `MAX_SESSION_MINUTES`     | No       | Hard cap on session duration in minutes (default: `480`)              | `480`                |
| `WARN_BEFORE_MINUTES`     | No       | Minutes before session end when the warning DM is sent (default: `5`) | `5`                  |
| `GRACE_PERIOD_MINUTES`    | No       | Extra minutes after the target before auto-end fires (default: `3`)   | `3`                  |
| `IDLE_REFRESH_MINUTES`    | No       | Dashboard idle-refresh interval in minutes (default: `5`)             | `5`                  |

---

## Running the bot

**Development** (file-watcher restarts on changes):

```sh
pnpm dev
```

**Production:**

```sh
pnpm start
```

Both scripts load `.env` automatically via the Node.js `--env-file` flag.

---

## Registering slash commands

Slash commands must be registered with Discord before they appear in the server. Run this once after cloning, and again whenever you add or rename a command:

```sh
node deploy-commands.js
```

---

## Available slash commands

| Command            | Description                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/clock-in`        | Start a new work session; shows a UI to select tasks and set an activity note                                   |
| `/clock-out`       | End the current work session and display a session summary                                                      |
| `/my-dashboard`    | View your monthly work statistics (total time, streaks, best day, etc.)                                         |
| `/my-tasks`        | View and manage your tasks with an optional `filter` parameter (`active`, `todo`, `in_progress`, `done`, `all`) |
| `/projects`        | List, create, edit, archive, restore, and delete your projects                                                  |
| `/projects-links`  | Manage links attached to your projects                                                                          |
| `/create-user`     | Register your Discord account in the database (required before using other commands)                            |
| `/setup-dashboard` | Initialize the live dashboard in the current channel (admin setup, run once per channel)                        |

---

## Architecture overview

### Entry point — `index.js`

1. Connects to PostgreSQL via Sequelize and syncs models (development only).
2. Attaches all service instances to every incoming interaction via a `prependListener` on `InteractionCreate`, making them available as `interaction.services`.
3. Recursively loads commands from `commands/` and events from `events/`.
4. On `ready`: restores in-memory timers for any sessions active before the process started, initialises the live dashboard, and registers cron jobs.

### Interaction routing — `events/interaction/`

The single `InteractionCreate` handler dispatches by type:

- **Chat input** → looks up `interaction.commandName` in `client.commands`, runs guards, then `execute`
- **Button** → keyed by the prefix before the first `:` in `customId`
- **Modal submit** → same prefix approach
- **Select menu** → same prefix approach

### Services pattern

All database access goes through service classes in `services/`. Commands and handlers access them via `interaction.services`, never by importing models directly.

| Service            | Responsibility                                                           |
| ------------------ | ------------------------------------------------------------------------ |
| `userService`      | User CRUD by Discord ID or internal UUID                                 |
| `sessionService`   | Start, end, update, and query work sessions; monthly stats; daily totals |
| `taskService`      | Task CRUD; link tasks to sessions; status filtering                      |
| `projectService`   | Project CRUD; member management; archive/restore                         |
| `linkService`      | Create, update, and delete links attached to projects                    |
| `dashboardService` | Persist and retrieve live dashboard channel/message state                |

### Guards

Commands declare a `guards` array. Before `execute` is called, each guard returns `true` to allow or `false` (after sending an ephemeral reply) to abort.

| Guard                    | Behaviour                                                      |
| ------------------------ | -------------------------------------------------------------- |
| `requireActiveSession`   | Aborts if no active session is found; offers a Clock In button |
| `requireNoActiveSession` | Aborts if an active session exists; offers a Clock Out button  |

### Feature modules — `features/`

- `liveDashboard/` — dashboard rendering, throttled updater, idle refresh, startup initialisation
- `session/` — timer lifecycle (warn → grace → auto-end), timer restoration, clock-in/out UI builders, personal dashboard UI
- `tasks/` — task dashboard embed builder
- `projects/links/` — link manager UI renderer

---

## Adding a new slash command

1. Create a `.js` file in the appropriate subfolder under `commands/`.
2. Export a default object:
   ```js
   export default {
     data: new SlashCommandBuilder().setName("my-command").setDescription("..."),
     guards: [], // optional
     async execute(interaction) {
       /* ... */
     },
   };
   ```
3. Run `node deploy-commands.js` to register the command with Discord.

---

## Code style

The project uses ESLint and Prettier. A Husky pre-commit hook runs both checks automatically.

```sh
pnpm lint          # check only
pnpm lint:fix      # auto-fix
pnpm format        # write formatting
pnpm format:check  # check only
```

Prettier settings: double quotes, trailing commas, 100-character print width.

---

## License

ISC
