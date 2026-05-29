"use strict";

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    sender_name:  { type: DataTypes.STRING, allowNull: false },
    sender_email: { type: DataTypes.STRING, allowNull: false },
    sender_phone: { type: DataTypes.STRING, allowNull: true },
    content:      { type: DataTypes.TEXT,   allowNull: false },
    is_read:      { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Enterprise, { foreignKey: "Enterprise_id", as: "enterprise" });
  };

  return Message;
};
