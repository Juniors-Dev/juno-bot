export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Settings = sequelize.define(
    "Settings",
    {
      discordUserId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: "discord_user_id",
        references: {
          model: "users",
          key: "discord_user_id",
        },
      },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: "All user preferences (personas, notifications, etc.)",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "settings",
      timestamps: false,
      underscored: true,
    },
  );

  Settings.associate = (models) => {
    Settings.belongsTo(models.User, {
      foreignKey: "discord_user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Settings;
};
