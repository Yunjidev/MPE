"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Quotes", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      quote_number: { type: Sequelize.STRING, allowNull: true },
      Enterprise_id: {
        type: Sequelize.INTEGER,
        references: { model: "Enterprises", key: "id" },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("draft", "sent", "accepted", "rejected", "expired"),
        allowNull: false,
        defaultValue: "draft",
      },
      quote_date: { type: Sequelize.DATEONLY, allowNull: false },
      validity_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },

      // Enterprise snapshot
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

      // Client info
      client_name:    { type: Sequelize.STRING, allowNull: false },
      client_company: { type: Sequelize.STRING, allowNull: true },
      client_address: { type: Sequelize.STRING, allowNull: true },
      client_city:    { type: Sequelize.STRING, allowNull: true },
      client_zip:     { type: Sequelize.STRING, allowNull: true },
      client_phone:   { type: Sequelize.STRING, allowNull: true },
      client_email:   { type: Sequelize.STRING, allowNull: true },

      // Work details
      work_start_date: { type: Sequelize.DATEONLY, allowNull: true },
      work_duration:   { type: Sequelize.STRING, allowNull: true },
      labor_description:  { type: Sequelize.TEXT, allowNull: true },
      labor_price_type:   { type: Sequelize.ENUM("hourly", "fixed"), allowNull: true },
      labor_price:        { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      travel_expenses:    { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      notes:              { type: Sequelize.TEXT, allowNull: true },

      // Line items stored as JSON
      items: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },

      // Conditions
      payment_conditions:  { type: Sequelize.TEXT, allowNull: true },
      delivery_conditions: { type: Sequelize.TEXT, allowNull: true },
      sav_conditions:      { type: Sequelize.TEXT, allowNull: true },
      is_free:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      tva_rate:            { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 20 },

      // Totals
      total_ht:  { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      total_tva: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      total_ttc: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Quotes");
  },
};
