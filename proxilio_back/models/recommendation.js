"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Recommendation extends Model {
    static associate(models) {
      Recommendation.belongsTo(models.User, {
        foreignKey: "User_id",
        as: "user",
      });
      Recommendation.belongsTo(models.Enterprise, {
        foreignKey: "Enterprise_id",
        as: "enterprise",
      });
    }
  }

  Recommendation.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 1000],
        },
      },
      Enterprise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Enterprise", key: "id" },
      },
      User_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "User", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "Recommendation",
      uniqueKeys: {
        unique_recommendation: {
          fields: ["Enterprise_id", "User_id"],
        },
      },
    },
  );

  return Recommendation;
};
