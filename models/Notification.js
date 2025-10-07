export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      projectId: {
        type: DataTypes.UUID,
        field: "project_id",
        references: {
          model: "projects",
          key: "id",
        },
        comment: "Links to project for project-specific notifications (e.g., GitHub PRs)",
      },
      sessionId: {
        type: DataTypes.UUID,
        field: "session_id",
        references: {
          model: "sessions",
          key: "id",
        },
        comment: "Links notification to a session - auto-cancel when session ends",
      },
      title: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [
            [
              "session_reminder",
              "idle_warning",
              "event_reminder",
              "task_due",
              "pr_notification",
              "github_activity",
            ],
          ],
        },
      },
      comment: "DB will enforce CHECK(type IN... in migration",
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      sendAt: {
        type: DataTypes.DATE,
        field: "send_at",
        comment: "NULL = send immediately, future date = scheduled",
      },
      scheduleCron: {
        type: DataTypes.STRING,
        field: "schedule_cron",
        comment: "For repeating notifications",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
        comment: "Set to false to pause or cancel this notification without deleting it",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "queued",
        validate: {
          isIn: [["queued", "scheduled", "locked", "sent", "canceled", "error"]],
        },
        comment:
          "DB-enforced via CHECK(status IN ('queued','scheduled','locked','sent','canceled','error')) in migration",
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "send_at"],
          where: { is_active: true, status: ["queued", "scheduled", "error"] },
          name: "ix__notifications__user_sendat__active_pending",
        },
        {
          fields: ["session_id"],
          where: { is_active: true, status: ["queued", "scheduled", "error"] },
          name: "ix__notifications__session_id__active_pending",
        },
        {
          fields: ["schedule_cron"],
          where: { is_active: true },
          name: "ix__notifications__cron__active",
        },
      ],
    },
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    Notification.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
      constraints: false,
    });

    Notification.belongsTo(models.Session, {
      foreignKey: "session_id",
      as: "session",
      constraints: false,
      onDelete: "CASCADE",
    });
  };

  return Notification;
};
