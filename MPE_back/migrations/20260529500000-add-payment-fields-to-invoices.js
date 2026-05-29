"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Invoices", "iban",              { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Invoices", "bic",               { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Invoices", "payment_reference", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Invoices", "bic_swift",         { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Invoices", "payment_days",      { type: Sequelize.INTEGER, allowNull: true, defaultValue: 30 });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Invoices", "iban");
    await queryInterface.removeColumn("Invoices", "bic");
    await queryInterface.removeColumn("Invoices", "payment_reference");
    await queryInterface.removeColumn("Invoices", "bic_swift");
    await queryInterface.removeColumn("Invoices", "payment_days");
  },
};
