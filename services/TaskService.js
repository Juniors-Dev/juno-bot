import { Op } from "sequelize";
export default class TaskService {
  constructor(db) {
    this.client = db.sequelize;
    this.Task = db.Task;
    this.SessionTask = db.SessionTask;
    this.Session = db.Session;
    this.User = db.User;
    this.Project = db.Project;
  }

  async getActiveByUser(userId, { includeProject = false } = {}) {
    const options = {
      where: {
        userId,
        status: { [Op.in]: ["todo", "in_progress"] },
      },
      order: [["updatedAt", "DESC"]],
    };

    if (includeProject) {
      options.include = [
        {
          model: this.Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ];
    }

    return this.Task.findAll(options);
  }

  async getById(taskId, userId, { includeProject = false } = {}) {
    const options = {
      where: { id: taskId, userId },
    };

    if (includeProject) {
      options.include = [
        {
          model: this.Project,
          as: "project",
          attributes: ["id", "name", "status"],
        },
      ];
    }

    return this.Task.findOne(options);
  }

  async getByUser(userId, { status = null, projectId = null, includeProject = false } = {}) {
    const where = { userId };

    if (status) {
      where.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const statusOrder = this.client.literal(
      "CASE status " +
        "WHEN 'todo' THEN 1 " +
        "WHEN 'in_progress' THEN 2 " +
        "WHEN 'done' THEN 3 " +
        "WHEN 'archived' THEN 4 " +
        "ELSE 99 END",
    );

    const options = {
      where,
      order: [
        [statusOrder, "ASC"],
        ["updatedAt", "DESC"],
      ],
    };

    if (includeProject) {
      options.include = [
        {
          model: this.Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ];
    }

    return this.Task.findAll(options);
  }

  async create(
    userId,
    { title, description = null, projectId = null, status = "todo", dueAt = null },
    { transaction } = {},
  ) {
    return this.Task.create(
      {
        userId,
        title: title.trim(),
        description,
        projectId,
        status,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
      { transaction },
    );
  }

  async updateStatus(taskId, userId, status) {
    const ALLOWED = ["todo", "in_progress", "done", "archived"];
    if (!ALLOWED.includes(status)) {
      throw Object.assign(new Error("Invalid status"), { code: "INVALID_STATUS" });
    }

    const [count, rows] = await this.Task.update(
      { status },
      { where: { id: taskId, userId }, returning: true, validate: true },
    );

    return count ? rows[0] : null;
  }

  async update(taskId, userId, updates) {
    const cleanUpdates = {};

    if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.projectId !== undefined) cleanUpdates.projectId = updates.projectId;
    if (updates.dueAt !== undefined)
      cleanUpdates.dueAt = updates.dueAt ? new Date(updates.dueAt) : null;

    const [count, rows] = await this.Task.update(cleanUpdates, {
      where: { id: taskId, userId },
      returning: true,
      validate: true,
    });

    return count ? rows[0] : null;
  }

  async archive(taskId, userId) {
    const [count] = await this.Task.update(
      { status: "archived" },
      { where: { id: taskId, userId }, validate: true },
    );

    return count > 0;
  }

  async delete(taskId, userId) {
    const count = await this.Task.destroy({ where: { id: taskId, userId } });
    return count > 0;
  }

  async linkToActiveSession(userId, taskId) {
    return this.client.transaction(async (t) => {
      const task = await this.Task.findOne({
        where: { id: taskId, userId },
        transaction: t,
      });

      if (!task) return null;

      const session = await this.Session.findOne({
        where: { userId, endedAt: null },
        transaction: t,
      });

      if (!session) return null;

      const [sessionTask] = await this.SessionTask.findOrCreate({
        where: {
          sessionId: session.id,
          taskId,
        },
        defaults: {
          sessionId: session.id,
          taskId,
        },
        transaction: t,
      });

      return sessionTask;
    });
  }

  async getCurrentTaskForSession(sessionId) {
    const sessionTask = await this.SessionTask.findOne({
      where: { sessionId },
      include: [
        {
          model: this.Task,
          as: "task",
          include: [
            {
              model: this.Project,
              as: "project",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return sessionTask?.task ?? null;
  }

  async getTasksForSession(sessionId) {
    const sessionTasks = await this.SessionTask.findAll({
      where: { sessionId },
      include: [
        {
          model: this.Task,
          as: "task",
          include: [
            {
              model: this.Project,
              as: "project",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return sessionTasks.map((st) => ({
      task: st.task,
      completedDuringSession: st.completedDuringSession,
      notes: st.notes,
      linkedAt: st.createdAt,
    }));
  }
}
