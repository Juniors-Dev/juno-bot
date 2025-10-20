import { UniqueConstraintError } from "sequelize";

export default class SessionService {
  constructor(db) {
    this.Session = db.Session;
    this.User = db.User;
  }

  /**
   * Get user's active session by userId.
   * @param {string} userId - Internal user UUID
   * @param {Object} [options]
   * @param {boolean} [options.includeUser=false] - Include user details in response
   * @returns {Promise<Object|null>} Active session or null if none exists
   */
  getOneActive(userId, { includeUser = false } = {}) {
    const options = { where: { userId, endedAt: null } };

    if (includeUser) {
      options.include = [
        {
          model: this.User,
          as: "user",
          attributes: ["id", "discordId", "name"],
        },
      ];
    }
    return this.Session.findOne(options);
  }

  /**
   * Get user's active session by Discord ID.
   * @param {string} discordId - Discord snowflake ID
   * @returns {Promise<Object|null>} Active session with user data, or null if none exists
   */
  async getOneActiveByDiscordId(discordId) {
    return this.Session.findOne({
      where: { endedAt: null },
      include: [
        {
          model: this.User,
          as: "user",
          where: { discordId },
          attributes: ["id", "discordId", "name"],
          required: true,
        },
      ],
    });
  }

  /**
   * Get session by session ID.
   * @param {string} sessionId - Session UUID
   * @param {Object} [options]
   * @param {boolean} [options.includeUser=false] - Include user details in response
   * @returns {Promise<Object|null>} Session or null if not found
   */
  getById(sessionId, { includeUser = false } = {}) {
    const options = { where: { id: sessionId } };

    if (includeUser) {
      options.include = [
        {
          model: this.User,
          as: "user",
          attributes: ["id", "discordId", "name"],
        },
      ];
    }
    return this.Session.findOne(options);
  }

  /**
   * List all active sessions
   * @returns {Promise<Array>} Array of active sessions with user info
   */
  getAllActive() {
    return this.Session.findAll({
      where: { endedAt: null },
      include: [
        {
          model: this.User,
          as: "user",
          attributes: ["id", "discordId", "name"],
          required: true,
        },
      ],
      order: [["startedAt", "ASC"]],
    });
  }

  /**
   * Start a new session (punch-in).
   * @param {string} userId - Internal user UUID
   * @param {Object} [options]
   * @param {string|null} [options.activity] - Initial activity/status text
   * @param {Date} [options.startedAt] - Session start time (defaults to now)
   * @returns {Promise<Object|null>} Created session, or null if user already has active session
   */
  async start(userId, { activity = null, startedAt = new Date() } = {}) {
    try {
      return await this.Session.create({
        userId,
        activity: this.#normalizeActivity(activity),
        startedAt,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) return null;
      throw err;
    }
  }

  /**
   * End user's active session (punch-out).
   * @param {string} userId - Internal user UUID
   * @param {Object} [options]
   * @param {Date} [options.endedAt] - Session end time (defaults to now)
   * @param {boolean} [options.autoEnded=false] - Whether session was auto-closed by system
   * @returns {Promise<{session: Object, durationMs: number}|null>} Session data with duration, or null if no active session
   */
  async end(userId, { endedAt = new Date(), autoEnded = false } = {}) {
    const [count, rows] = await this.Session.update(
      { endedAt, autoEnded },
      { where: { userId, endedAt: null }, returning: true },
    );

    if (!count) return null;
    const session = rows[0];
    const durationMs = new Date(session.endedAt) - new Date(session.startedAt);
    return { session, durationMs };
  }

  /**
   * Update/set active session's activity/status text.
   * @param {string} userId - Internal user UUID
   * @param {string|null} activity - Activity text
   * @returns {Promise<Object|null>} Updated session or null if no active session
   */
  async updateActivity(userId, activity) {
    const [count, rows] = await this.Session.update(
      { activity: this.#normalizeActivity(activity) },
      { where: { userId, endedAt: null }, returning: true },
    );

    return count ? rows[0] : null;
  }

  /**
   * Set target duration for active session.
   * @param {string} userId - Internal user UUID
   * @param {number|null} minutes - Target duration in minutes (1-480), or null to clear
   * @returns {Promise<{session: Object, targetEndsAt: Date|null}|null>} Session with calculated end time, or null if no active session
   */
  async setTargetDuration(userId, minutes) {
    const [count, rows] = await this.Session.update(
      { targetDurationMinutes: minutes },
      {
        where: { userId, endedAt: null },
        returning: true,
        validate: true,
      },
    );

    if (!count) return null;
    const session = rows[0];
    const targetEndsAt = minutes
      ? new Date(new Date(session.startedAt).getTime() + minutes * 60000)
      : null;

    return { session, targetEndsAt };
  }

  #normalizeActivity(input, max = 500) {
    if (input == null) return null;
    const str = String(input).trim();
    return str ? str.slice(0, max) : null;
  }
}
