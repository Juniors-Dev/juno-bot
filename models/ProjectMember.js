export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const ProjectMember = sequelize.define(
    "ProjectMember",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "project_id",
        references: {
          model: "projects",
          key: "id",
        },
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
      permissions: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: "Additional permissions for the member",
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: "joined_at",
      },
    },
    {
      tableName: "project_members",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["project_id", "discord_user_id"],
          name: "uq__project_members__project_id_discord_user_id",
        },
        {
          fields: ["project_id"],
          name: "ix__project_members__project_id",
        },
      ],
    },
  );

  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });

    ProjectMember.belongsTo(models.User, {
      foreignKey: "discord_user_id",
      as: "user",
    });
  };

  return ProjectMember;
};
