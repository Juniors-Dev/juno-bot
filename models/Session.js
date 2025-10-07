export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Session = sequelize.define(
    "Session",
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
      },
      taskId: {
        type: DataTypes.INTEGER,
        field: "task_id",
        references: {
          model: "tasks",
          key: "id",
        },
      },
      activity: {
        type: DataTypes.TEXT,
        comment: "What the user is working on / Status message",
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "started_at",
        comment: "Set at punch-in",
      },
      endedAt: {
        type: DataTypes.DATE,
        field: "ended_at",
        comment: "NULL while active, set at punch-out",
      },
      targetDurationMinutes: {
        type: DataTypes.INTEGER,
        field: "target_duration_minutes",
        comment: "User intended session length",
      },
      autoEnded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "auto_ended",
      },
    },
    {
      tableName: "sessions",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
          where: { ended_at: null },
          name: "uq__sessions__user_id__ended_at_null",
        },
        {
          fields: ["user_id", "started_at"],
          name: "ix__sessions__user_started_at",
        },
      ],
    },
  );

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    Session.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
      constraints: false,
    });

    Session.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
      constraints: false,
    });

    Session.hasMany(models.Notification, {
      foreignKey: "session_id",
      as: "notifications",
      onDelete: "CASCADE",
    });
  };

  return Session;
};
