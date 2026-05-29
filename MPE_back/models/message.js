"use strict";

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    sender_name:  { type: DataTypes.STRING, allowNull: false },
    sender_email: { type: DataTypes.STRING, allowNull: false },
    sender_phone: { type: DataTypes.STRING, allowNull: true },
    content:      { type: DataTypes.TEXT,   allowNull: false },
    is_read:      { type: DataTypes.BOOLEAN, defaultValue: false },
    user_unread:  { type: DataTypes.BOOLEAN, defaultValue: false },
    User_id:      { type: DataTypes.INTEGER, allowNull: true },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Enterprise, { foreignKey: "Enterprise_id", as: "enterprise" });
    Message.belongsTo(models.User, { foreignKey: "User_id", as: "user" });
    Message.hasMany(models.MessageReply, { foreignKey: "Message_id", as: "replies" });
  };

  return Message;
};
