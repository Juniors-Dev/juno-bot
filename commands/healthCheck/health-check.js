import { SlashCommandBuilder } from "discord.js";

// ---- In-memory state for DB failures (resets when bot restarts) ----
let consecutiveDbFailures = 0;

// ---- Helper: build admin mentions from env ----
function getAdminMentions() {
  const raw = process.env.adminUserIds || "";
  if (!raw) return "";
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) return "";
  return ids.map((id) => `<@${id}>`).join(" ");
}

// ---- Helper: safely log DB errors to the issue channel ----
async function postDbErrorToIssuesChannel(interaction, error, isRepeated) {
  const channelId = process.env.botIssuesChannelId;
  if (!channelId) {
    console.warn("[BOT-ISSUES] botIssuesChannelId is not set in .env");
    return;
  }

  try {
    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel || typeof channel.send !== "function") {
      console.error("[BOT-ISSUES] Channel is not text-based or not sendable:", channelId);

      return;
    }

    let content =
      `⚠️ **DB health check failure**\n` +
      `Guild: \`${interaction.guild?.id ?? "DM"}\`\n` +
      `User: <@${interaction.user.id}> (${interaction.user.id})\n` +
      `Error: \`${error.message}\``;

    if (isRepeated) {
      const adminMentions = getAdminMentions();
      if (adminMentions) {
        content += `\n\n🚨 **Repeated failures detected.** ${adminMentions}`;
      }
    }

    await channel.send({ content });
  } catch (err) {
    // Never crash the command because of logging failures
    console.error("[BOT-ISSUES ERROR] Failed to send DB error message:", err);
  }
}

export const data = new SlashCommandBuilder()
  .setName("health")
  .setDescription("Check if the bot and database are running normally.");

export async function execute(interaction) {
  console.log("[HEALTH] command started");

  const uptime = process.uptime();
  const uptimeSeconds = Math.floor(uptime % 60);
  const uptimeMinutes = Math.floor((uptime / 60) % 60);
  const uptimeHours = Math.floor((uptime / 3600) % 24);
  const uptimeDays = Math.floor(uptime / 86400);

  let dbStatus = "🟢 Connected";
  let dbErrorMessage = null;

  // ---- DB health check ----
  try {
    console.log("[HEALTH] calling sequelize.authenticate()");
    await interaction.db.sequelize.authenticate();
    console.log("[HEALTH] DB OK");
    // DB OK → reset failure counter
    consecutiveDbFailures = 0;
  } catch (error) {
    console.log("[HEALTH] DB ERROR CAUGHT IN COMMAND");
    dbStatus = "🔴 Unavailable";
    dbErrorMessage = error.message;
    console.error("[DB ERROR]:", error);

    // Track consecutive failures
    consecutiveDbFailures += 1;
    const threshold = Number(process.env.dbHealthFailureThreshold || "3");
    const isRepeated = consecutiveDbFailures >= threshold;

    // Fire-and-forget logging to #denis-issue-log
    void postDbErrorToIssuesChannel(interaction, error, isRepeated);
  }

  // ---- Reply ----
  try {
    await interaction.reply({
      content: `🩺 **Bot Health Status**

**Bot:** 🟢 Online  
**Uptime:** ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s  
**Ping:** ${interaction.client.ws.ping}ms  
**Database:** ${dbStatus}

${dbErrorMessage ? `⚠️ **DB Error:**\n\`\`\`\n${dbErrorMessage}\n\`\`\`` : ""}`,
      ephemeral: true,
    });
    console.log("[HEALTH] reply sent");
  } catch (err) {
    console.error("[HEALTH] failed to reply:", err);
  }
}
