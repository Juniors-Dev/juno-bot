import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("health")
    .setDescription("Check if the bot and database are healthy")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  skipContext: true,

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { healthService } = interaction.services;

    try {
      const result = await healthService.check(interaction.client);
      await interaction.editReply(formatResult(result));
    } catch (err) {
      console.error("[/health] Unexpected error:", err);
      await interaction.editReply("🔴 Health check itself threw an error. Check logs.");
    }
  },
};

function formatResult(result) {
  const { discord, database } = result;

  const heartbeat = discord.pingMs == null ? "—" : `${discord.pingMs}ms`;
  const discordLine = discord.ok
    ? `**Discord:** 🟢 Ready (${heartbeat} heartbeat)`
    : `**Discord:** 🔴 ${discord.reason}`;

  const databaseLine = database.ok
    ? `**Database:** 🟢 Connected (${database.latencyMs}ms)`
    : `**Database:** 🔴 ${database.reason}`;

  const overall = result.ok ? "🟢 Healthy" : "🔴 Degraded";

  return [
    `## 🩺 Bot Health — ${overall}`,
    discordLine,
    databaseLine,
    `**Uptime:** ${formatUptime(process.uptime())}`,
  ].join("\n");
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds / 3600) % 24);
  const m = Math.floor((seconds / 60) % 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}
