"use strict";

module.exports = (sequelize, DataTypes) => {
  const SiteSetting = sequelize.define("SiteSetting", {
    key:   { type: DataTypes.STRING(100), primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: true },
  }, { timestamps: false });

  return SiteSetting;
};
