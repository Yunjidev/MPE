"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Enterprises", "latitude", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("Enterprises", "longitude", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Enterprises", "latitude");
    await queryInterface.removeColumn("Enterprises", "longitude");
  },
};
