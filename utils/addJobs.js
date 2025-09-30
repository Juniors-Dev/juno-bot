import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function addJobs(client) {
  const files = fs.readdirSync(path.join(__dirname, "../jobs")).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const mod = await import(`../jobs/${file}`);
    const job = mod.default ?? mod;
    if (!job?.schedule || !job?.task) {
      console.warn(`Skipped job ${file}: missing schedule/task`);
      continue;
    }
    cron.schedule(job.schedule, () => job.task(client), {
      timezone: "Europe/Oslo",
    });
  }
}
