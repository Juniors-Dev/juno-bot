export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      discordId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "discord_id",
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
          fields: ["discord_id"],
          name: "uq__users__discord_id",
        },
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
      foreignKey: "user_id",
      otherKey: "project_id",
      as: "projects",
    });

    User.hasOne(models.Settings, {
      foreignKey: "user_id",
      as: "settings",
      onDelete: "CASCADE",
    });

    User.hasMany(models.ProjectMember, {
      foreignKey: "user_id",
      as: "projectMembers",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Session, {
      foreignKey: "user_id",
      as: "sessions",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Task, {
      foreignKey: "user_id",
      as: "tasks",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Notification, {
      foreignKey: "user_id",
      as: "notifications",
      onDelete: "CASCADE",
    });
  };

  return User;
};
