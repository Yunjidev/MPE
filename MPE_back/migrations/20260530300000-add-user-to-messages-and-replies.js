"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajouter User_id sur Messages
    await queryInterface.addColumn("Messages", "User_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    });

    // Créer la table MessageReplies
    await queryInterface.createTable("MessageReplies", {
      id:          { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      Message_id:  {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "Messages", key: "id" },
        onDelete: "CASCADE",
      },
      content:     { type: Sequelize.TEXT,   allowNull: false },
      sender_type: { type: Sequelize.ENUM("enterprise", "user"), allowNull: false },
      createdAt:   { allowNull: false, type: Sequelize.DATE },
      updatedAt:   { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("MessageReplies");
    await queryInterface.removeColumn("Messages", "User_id");
  },
};
