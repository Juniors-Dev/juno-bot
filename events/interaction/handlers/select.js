import { handleClockInSelects } from "../features/sessions/handle-clock-in-interactions.js";

export const selectHandlers = {
  clock_in: {
    run: handleClockInSelects,
    context: { needsUser: true, needsSession: false },
  },
};
