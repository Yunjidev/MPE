"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Enterprises", "iban",              { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "bic",               { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "payment_reference", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Enterprises", "bic_swift",         { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Enterprises", "iban");
    await queryInterface.removeColumn("Enterprises", "bic");
    await queryInterface.removeColumn("Enterprises", "payment_reference");
    await queryInterface.removeColumn("Enterprises", "bic_swift");
  },
};
