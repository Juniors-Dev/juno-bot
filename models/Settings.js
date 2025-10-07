export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Settings = sequelize.define(
    "Settings",
    {
      userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: "All user preferences (personas, notifications, etc.)",
      },
    },
    {
      tableName: "settings",
      timestamps: true,
      underscored: true,
    },
  );

  Settings.associate = (models) => {
    Settings.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Settings;
};
