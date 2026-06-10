"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Enterprises", "tva_number",   { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "legal_form",   { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "legal_status", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "rcs_number",   { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "rm_number",    { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Enterprises", "tva_number");
    await queryInterface.removeColumn("Enterprises", "legal_form");
    await queryInterface.removeColumn("Enterprises", "legal_status");
    await queryInterface.removeColumn("Enterprises", "rcs_number");
    await queryInterface.removeColumn("Enterprises", "rm_number");
  },
};
