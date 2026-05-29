"use strict";

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    type:    { type: DataTypes.ENUM("message_received", "message_reply", "reservation_new", "reservation_updated"), allowNull: false },
    title:   { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT,   allowNull: true },
    link:    { type: DataTypes.STRING, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: "User_id", as: "user" });
  };

  return Notification;
};
