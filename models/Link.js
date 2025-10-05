export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Link = sequelize.define(
    "Link",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: DataTypes.UUID,
        field: "project_id",
        references: {
          model: "projects",
          key: "id",
        },
      },
      kind: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "other",
        validate: {
          isIn: [["github", "figma", "docs", "other"]],
        },
        comment: "DB will enforce CHECK(kind IN ('github','figma','docs','other')) in migration",
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "links",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["project_id", "url"],
          name: "uq__links__project_id_url",
        },
        {
          fields: ["project_id"],
          name: "ix__links__project_id",
        },
      ],
    },
  );

  Link.associate = (models) => {
    Link.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return Link;
};
