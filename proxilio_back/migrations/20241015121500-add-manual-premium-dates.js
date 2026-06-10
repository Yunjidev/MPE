"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn("Enterprises", "premiumManualStart", {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn("Enterprises", "premiumManualEnd", {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn("Enterprises", "premiumManualStart"),
      queryInterface.removeColumn("Enterprises", "premiumManualEnd"),
    ]);
  },
};

