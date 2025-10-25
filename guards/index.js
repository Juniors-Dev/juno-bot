import { requireActiveSession } from "./requireActiveSession.js";
import { requireNoActiveSession } from "./requireNoActiveSession.js";

export const guardMap = {
  activeSession: requireActiveSession,
  noSession: requireNoActiveSession,
};

export { requireActiveSession, requireNoActiveSession };
