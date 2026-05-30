"use strict";

module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define("Referral", {
    referrer_id:      { type: DataTypes.INTEGER, allowNull: false },
    referred_email:   { type: DataTypes.STRING,  allowNull: false },
    referred_user_id: { type: DataTypes.INTEGER, allowNull: true },
    validated_at:     { type: DataTypes.DATE,    allowNull: true },
  });

  Referral.associate = (models) => {
    Referral.belongsTo(models.User, { foreignKey: "referrer_id",      as: "referrer" });
    Referral.belongsTo(models.User, { foreignKey: "referred_user_id", as: "referredUser" });
  };

  return Referral;
};
