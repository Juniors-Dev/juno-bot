export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "todo",
        validate: {
          isIn: [["todo", "in_progress", "done", "archived"]],
        },
        comment:
          "DB-enforced via CHECK(status IN ('todo','in_progress','done','archived')) in migration",
      },
      dueAt: {
        type: DataTypes.DATE,
        field: "due_at",
      },
    },
    {
      tableName: "tasks",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "status"],
          name: "ix__tasks__user_status",
        },
        {
          fields: ["project_id", "status"],
          name: "ix__tasks__project_status",
        },
      ],
    },
  );

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Task.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });

    Task.hasMany(models.Session, {
      foreignKey: "task_id",
      as: "sessions",
    });
  };

  return Task;
};
