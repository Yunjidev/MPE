"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Enterprises", "payment_methods", { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Enterprises", "service_types",   { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Enterprises", "languages",       { type: Sequelize.TEXT, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Enterprises", "payment_methods");
    await queryInterface.removeColumn("Enterprises", "service_types");
    await queryInterface.removeColumn("Enterprises", "languages");
  },
};
