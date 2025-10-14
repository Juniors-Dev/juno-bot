export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const DashboardState = sequelize.define(
    "DashboardState",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "channel_id",
        comment: "Discord channel ID",
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "message_id",
        comment: "Discord message ID for the dashboard",
      },
      kind: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "main",
        validate: {
          isIn: [ALL_KINDS],
        },
      },
    },
    {
      tableName: "live_dashboard",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["kind"],
          name: "uq_dashboard_kind",
        },
        { 
          unique: true, 
          fields: ["message_id"], 
          name: "uq_dashboard_message"
        },
      ],
    },
  );

  return DashboardState;
};
