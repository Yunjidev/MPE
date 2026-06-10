"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reservations", "manual_client_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Reservations", "manual_client_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Reservations", "manual_client_name");
    await queryInterface.removeColumn("Reservations", "manual_client_email");
  },
};
