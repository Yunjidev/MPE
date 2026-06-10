"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quote extends Model {
    static associate(models) {
      Quote.belongsTo(models.Enterprise, { foreignKey: "Enterprise_id", as: "enterprise" });
    }
  }

  Quote.init(
    {
      quote_number:    { type: DataTypes.STRING, allowNull: true },
      Enterprise_id:   { type: DataTypes.INTEGER },
      status:          { type: DataTypes.ENUM("draft", "sent", "accepted", "rejected", "expired"), defaultValue: "draft" },
      quote_date:      { type: DataTypes.DATEONLY, allowNull: false },
      validity_days:   { type: DataTypes.INTEGER, defaultValue: 30 },

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

      work_start_date:    DataTypes.DATEONLY,
      work_duration:      DataTypes.STRING,
      labor_description:  DataTypes.TEXT,
      labor_price_type:   DataTypes.ENUM("hourly", "fixed"),
      labor_price:        DataTypes.DECIMAL(10, 2),
      travel_expenses:    { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      notes:              DataTypes.TEXT,

      items: { type: DataTypes.JSON, defaultValue: [] },

      payment_conditions:  DataTypes.TEXT,
      delivery_conditions: DataTypes.TEXT,
      sav_conditions:      DataTypes.TEXT,
      is_free:   { type: DataTypes.BOOLEAN, defaultValue: true },
      tva_rate:  { type: DataTypes.DECIMAL(5, 2), defaultValue: 20 },

      total_ht:  DataTypes.DECIMAL(10, 2),
      total_tva: DataTypes.DECIMAL(10, 2),
      total_ttc: DataTypes.DECIMAL(10, 2),
    },
    { sequelize, modelName: "Quote" }
  );

  return Quote;
};
