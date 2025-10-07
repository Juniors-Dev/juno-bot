export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
        validate: {
          isIn: [["active", "paused", "archived"]],
        },
        comment: "DB-enforced via CHECK(status IN ('active','paused','archived')) in migration",
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["name"],
          name: "uq__projects__name",
        },
      ],
    },
  );

  Project.associate = (models) => {
    Project.belongsToMany(models.User, {
      through: models.ProjectMember,
      foreignKey: "project_id",
      otherKey: "user_id",
      as: "members",
    });

    Project.hasMany(models.ProjectMember, {
      foreignKey: "project_id",
      as: "projectMembers",
      onDelete: "CASCADE",
    });

    Project.hasMany(models.Link, {
      foreignKey: "project_id",
      as: "links",
      onDelete: "CASCADE",
    });

    Project.hasMany(models.Session, {
      foreignKey: "project_id",
      as: "sessions",
      onDelete: "SET NULL",
    });
  };

  return Project;
};
