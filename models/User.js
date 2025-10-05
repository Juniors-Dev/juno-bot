export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const User = sequelize.define(
    "User",
    {
      discordUserId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: "discord_user_id",
        validate: {
          notEmpty: true,
        },
        comment: "Discord snowflake ID",
      },
      githubUsername: {
        type: DataTypes.STRING,
        field: "github_username",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["github_username"],
          name: "uq__users__github_username",
        },
      ],
    },
  );

  User.associate = (models) => {
    User.belongsToMany(models.Project, {
      through: models.ProjectMember,
      foreignKey: "discord_user_id",
      otherKey: "project_id",
      as: "projects",
    });

    User.hasOne(models.Settings, {
      foreignKey: "discord_user_id",
      as: "settings",
      onDelete: "CASCADE",
    });

    User.hasMany(models.ProjectMember, {
      foreignKey: "discord_user_id",
      as: "projectMembers",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Session, {
      foreignKey: "discord_user_id",
      as: "sessions",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Task, {
      foreignKey: "discord_user_id",
      as: "tasks",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Notification, {
      foreignKey: "discord_user_id",
      as: "notifications",
      onDelete: "CASCADE",
    });
  };

  return User;
};
