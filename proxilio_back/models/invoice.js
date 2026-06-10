"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Enterprise, { foreignKey: "Enterprise_id", as: "enterprise" });
      Invoice.belongsTo(models.Quote,      { foreignKey: "Quote_id",      as: "quote" });
    }
  }

  Invoice.init(
    {
      invoice_number: DataTypes.STRING,
      Enterprise_id:  DataTypes.INTEGER,
      Quote_id:       { type: DataTypes.INTEGER, allowNull: true },
      Reservation_id: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.ENUM("draft", "sent", "paid", "overdue", "cancelled"), defaultValue: "draft" },
      invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
      due_date:     { type: DataTypes.DATEONLY, allowNull: true },
      paid_at:      { type: DataTypes.DATEONLY, allowNull: true },

      ent_name:        DataTypes.STRING,
      ent_address:     DataTypes.STRING,
      ent_city:        DataTypes.STRING,
      ent_zip:         DataTypes.STRING,
      ent_phone:       DataTypes.STRING,
      ent_email:       DataTypes.STRING,
      ent_siret:       DataTypes.STRING,
      ent_tva_number:  DataTypes.STRING,
      ent_legal_form:  DataTypes.STRING,
      ent_legal_status:DataTypes.STRING,
      ent_rcs:         DataTypes.STRING,
      ent_rm:          DataTypes.STRING,

      client_name:    { type: DataTypes.STRING, allowNull: false },
      client_company: DataTypes.STRING,
      client_address: DataTypes.STRING,
      client_city:    DataTypes.STRING,
      client_zip:     DataTypes.STRING,
      client_phone:   DataTypes.STRING,
      client_email:   DataTypes.STRING,

      items:             { type: DataTypes.JSON, defaultValue: [] },
      labor_description: DataTypes.TEXT,
      labor_price_type:  DataTypes.ENUM("hourly", "fixed"),
      labor_price:       DataTypes.DECIMAL(10, 2),
      travel_expenses:   { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

      payment_conditions: DataTypes.TEXT,
      payment_method:     DataTypes.STRING,
      payment_days:       { type: DataTypes.INTEGER, defaultValue: 30 },
      iban:               DataTypes.STRING,
      bic:                DataTypes.STRING,
      payment_reference:  DataTypes.STRING,
      bic_swift:          DataTypes.STRING,
      notes:              DataTypes.TEXT,

      tva_rate:  { type: DataTypes.DECIMAL(5, 2), defaultValue: 20 },
      total_ht:  DataTypes.DECIMAL(10, 2),
      total_tva: DataTypes.DECIMAL(10, 2),
      total_ttc: DataTypes.DECIMAL(10, 2),
    },
    { sequelize, modelName: "Invoice" }
  );

  return Invoice;
};
