"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Enterprises", "is_claimed", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn("Enterprises", "is_public_listing", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Enterprises", "claim_token", {
      type: Sequelize.STRING(8),
      allowNull: true,
    });
    await queryInterface.addColumn("Enterprises", "claim_token_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Enterprises", "claim_mail", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    for (const col of ["is_claimed","is_public_listing","claim_token","claim_token_expires_at","claim_mail"]) {
      await queryInterface.removeColumn("Enterprises", col);
    }
  },
};
