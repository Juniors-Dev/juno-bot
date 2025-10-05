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
      discordUserId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "discord_user_id",
        references: {
          model: "users",
          key: "discord_user_id",
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
          fields: ["discord_user_id", "status"],
          name: "ix__tasks__user_status",
        },
      ],
    },
  );

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "discord_user_id",
      as: "user",
    });

    Task.hasMany(models.Session, {
      foreignKey: "task_id",
      as: "sessions",
    });
  };

  return Task;
};
