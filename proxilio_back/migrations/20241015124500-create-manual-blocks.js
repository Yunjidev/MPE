"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ManualBlocks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Enterprise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Enterprises",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("ManualBlocks", {
      fields: ["Enterprise_id", "date"],
      name: "manual_blocks_enterprise_date_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "ManualBlocks",
      "manual_blocks_enterprise_date_idx",
    );
    await queryInterface.dropTable("ManualBlocks");
  },
};

