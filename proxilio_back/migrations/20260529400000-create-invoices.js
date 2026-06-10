"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      invoice_number: { type: Sequelize.STRING, allowNull: true },
      Enterprise_id: {
        type: Sequelize.INTEGER,
        references: { model: "Enterprises", key: "id" },
        onDelete: "CASCADE",
      },
      Quote_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Quotes", key: "id" },
        onDelete: "SET NULL",
      },
      Reservation_id: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM("draft", "sent", "paid", "overdue", "cancelled"),
        allowNull: false,
        defaultValue: "draft",
      },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date:     { type: Sequelize.DATEONLY, allowNull: true },
      paid_at:      { type: Sequelize.DATEONLY, allowNull: true },

      ent_name:        { type: Sequelize.STRING, allowNull: true },
      ent_address:     { type: Sequelize.STRING, allowNull: true },
      ent_city:        { type: Sequelize.STRING, allowNull: true },
      ent_zip:         { type: Sequelize.STRING, allowNull: true },
      ent_phone:       { type: Sequelize.STRING, allowNull: true },
      ent_email:       { type: Sequelize.STRING, allowNull: true },
      ent_siret:       { type: Sequelize.STRING, allowNull: true },
      ent_tva_number:  { type: Sequelize.STRING, allowNull: true },
      ent_legal_form:  { type: Sequelize.STRING, allowNull: true },
      ent_legal_status:{ type: Sequelize.STRING, allowNull: true },
      ent_rcs:         { type: Sequelize.STRING, allowNull: true },
      ent_rm:          { type: Sequelize.STRING, allowNull: true },

      client_name:    { type: Sequelize.STRING, allowNull: false },
      client_company: { type: Sequelize.STRING, allowNull: true },
      client_address: { type: Sequelize.STRING, allowNull: true },
      client_city:    { type: Sequelize.STRING, allowNull: true },
      client_zip:     { type: Sequelize.STRING, allowNull: true },
      client_phone:   { type: Sequelize.STRING, allowNull: true },
      client_email:   { type: Sequelize.STRING, allowNull: true },

      items:              { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      labor_description:  { type: Sequelize.TEXT, allowNull: true },
      labor_price_type:   { type: Sequelize.ENUM("hourly", "fixed"), allowNull: true },
      labor_price:        { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      travel_expenses:    { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },

      payment_conditions:  { type: Sequelize.TEXT, allowNull: true },
      payment_method:      { type: Sequelize.STRING, allowNull: true },
      notes:               { type: Sequelize.TEXT, allowNull: true },

      tva_rate:  { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 20 },
      total_ht:  { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      total_tva: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      total_ttc: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Invoices");
  },
};
