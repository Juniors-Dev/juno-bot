import { UniqueConstraintError } from "sequelize";

export default class SessionService {
  constructor(db) {
    this.Session = db.Session;
    this.User = db.User;
  }

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

  async start(
    userId,
    { activity = null, startedAt = new Date(), targetDurationMinutes = 120 } = {},
  ) {
    try {
      return await this.Session.create({
        userId,
        activity: this.#normalizeActivity(activity),
        startedAt,
        targetDurationMinutes,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) return null;
      throw err;
    }
  }

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

  async updateActivity(userId, activity) {
    const [count, rows] = await this.Session.update(
      { activity: this.#normalizeActivity(activity) },
      { where: { userId, endedAt: null }, returning: true },
    );

    return count ? rows[0] : null;
  }

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
