"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reservations", "Enterprise_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Enterprises",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addIndex("Reservations", {
      fields: ["Enterprise_id"],
      name: "reservations_enterprise_id_idx",
    });

    await queryInterface.addConstraint("Reservations", {
      fields: ["date", "start_time", "Enterprise_id"],
      type: "unique",
      name: "reservations_unique_enterprise_slot",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "Reservations",
      "reservations_unique_enterprise_slot",
    );
    await queryInterface.removeIndex(
      "Reservations",
      "reservations_enterprise_id_idx",
    );
    await queryInterface.removeColumn("Reservations", "Enterprise_id");
  },
};

