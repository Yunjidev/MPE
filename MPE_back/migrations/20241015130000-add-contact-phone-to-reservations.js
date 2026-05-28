"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reservations", "contact_phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "phone");
    await queryInterface.removeColumn("Reservations", "contact_phone");
  },
};
