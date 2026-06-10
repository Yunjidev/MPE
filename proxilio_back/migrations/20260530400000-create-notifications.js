"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id:       { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      User_id:  { type: Sequelize.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
      type:     { type: Sequelize.ENUM("message_received", "message_reply", "reservation_new", "reservation_updated"), allowNull: false },
      title:    { type: Sequelize.STRING, allowNull: false },
      content:  { type: Sequelize.TEXT,   allowNull: true },
      link:     { type: Sequelize.STRING, allowNull: true },
      is_read:  { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt:{ allowNull: false, type: Sequelize.DATE },
      updatedAt:{ allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Notifications");
  },
};
