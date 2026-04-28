import { BOT_ISSUES_CHANNEL_ID, FAILURE_THRESHOLD, ADMIN_USER_IDS } from "./constants.js";

let consecutiveFailures = 0;
let pingedThisEpisode = false;

export async function handleCheckResult(client, result) {
  if (!BOT_ISSUES_CHANNEL_ID) return;

  if (result.ok) {
    await handleSuccess(client);
    return;
  }

  await handleFailure(client, result);
}

async function handleSuccess(client) {
  if (consecutiveFailures === 0) return;
  await post(
    client,
    `✅ **Health recovered** after ${consecutiveFailures} failed check${
      consecutiveFailures === 1 ? "" : "s"
    }.`,
  );

  consecutiveFailures = 0;
  pingedThisEpisode = false;
}

async function handleFailure(client, result) {
  consecutiveFailures++;
  let content =
    `⚠️ **Health check failed** (${consecutiveFailures}/${FAILURE_THRESHOLD})\n` +
    `Reason: \`${failureReasons(result)}\``;

  if (!pingedThisEpisode && consecutiveFailures >= FAILURE_THRESHOLD) {
    const mentions = ADMIN_USER_IDS.map((id) => `<@${id}>`).join(" ");
    if (mentions) {
      content += `\n\n🚨 **Repeated failures.** ${mentions}`;
    }
    pingedThisEpisode = true;
  }

  await post(client, content);
}

function failureReasons(result) {
  const reasons = [];
  if (!result.discord.ok) reasons.push(`discord: ${result.discord.reason}`);
  if (!result.database.ok) reasons.push(`database: ${result.database.reason}`);
  return reasons.length ? reasons.join(", ") : "unknown";
}

async function post(client, content) {
  try {
    const channel = await client.channels.fetch(BOT_ISSUES_CHANNEL_ID);
    await channel.send({ content });
  } catch (err) {
    console.error("[Health] Failed to post alert:", err?.message ?? err);
  }
}
