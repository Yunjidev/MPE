"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id:           { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      Enterprise_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "Enterprises", key: "id" },
        onDelete: "CASCADE",
      },
      sender_name:  { type: Sequelize.STRING,  allowNull: false },
      sender_email: { type: Sequelize.STRING,  allowNull: false },
      sender_phone: { type: Sequelize.STRING,  allowNull: true },
      content:      { type: Sequelize.TEXT,    allowNull: false },
      is_read:      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt:    { allowNull: false, type: Sequelize.DATE },
      updatedAt:    { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Messages");
  },
};
