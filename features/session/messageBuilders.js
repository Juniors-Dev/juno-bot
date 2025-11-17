import { time, TimestampStyles } from "discord.js";
import { formatDurationMs, formatMinutesHm } from "../../utils/formatTime.js";

export function buildClockOutMessagePayload({ session, durationMs }) {
  const started = time(session.startedAt, TimestampStyles.ShortTime);
  const ended = time(session.endedAt, TimestampStyles.ShortTime);
  const duration = formatDurationMs(durationMs, { mode: "round" });
  const activityText = session.activity ? `\nWorked on: ${session.activity}` : "";

  return {
    content:
      `✅ **Clocked out**\n\n` +
      `Started: ${started}\n` +
      `Ended: ${ended}\n` +
      `You worked for ${duration}${activityText}`,
    components: [],
  };
}

export function buildClockInMessagePayload({ session, targetDurationMinutes, activity }) {
  const started = time(session.startedAt, TimestampStyles.ShortTime);
  const plannedEndDate = new Date(session.startedAt.getTime() + targetDurationMinutes * 60000);
  const endsAt = time(plannedEndDate, TimestampStyles.ShortTime);
  const duration = formatMinutesHm(targetDurationMinutes);
  const activityText = activity ? `\nWorking on: ${activity}` : "";

  return {
    content:
      `✅ **Clocked in!**\n\n` +
      `Started: ${started}\n` +
      `Planned duration: ${duration}\n` +
      `Session ends: ${endsAt}${activityText}`,
    components: [],
  };
}
