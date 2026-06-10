"use strict";

module.exports = (sequelize, DataTypes) => {
  const MessageReply = sequelize.define("MessageReply", {
    content:     { type: DataTypes.TEXT, allowNull: false },
    sender_type: { type: DataTypes.ENUM("enterprise", "user"), allowNull: false },
  });

  MessageReply.associate = (models) => {
    MessageReply.belongsTo(models.Message, { foreignKey: "Message_id", as: "message" });
  };

  return MessageReply;
};
