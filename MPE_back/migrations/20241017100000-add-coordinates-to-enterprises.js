"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable("Enterprises");
    if (!tableDesc.latitude) {
      await queryInterface.addColumn("Enterprises", "latitude", {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }
    if (!tableDesc.longitude) {
      await queryInterface.addColumn("Enterprises", "longitude", {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Enterprises", "latitude");
    await queryInterface.removeColumn("Enterprises", "longitude");
  },
};
