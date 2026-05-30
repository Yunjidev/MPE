"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "referral_code", {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Users", "referral_rewards_claimed", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.createTable("Referrals", {
      id:               { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      referrer_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
      referred_email:   { type: Sequelize.STRING, allowNull: false, unique: true },
      referred_user_id: { type: Sequelize.INTEGER, allowNull: true,  references: { model: "Users", key: "id" }, onDelete: "SET NULL" },
      validated_at:     { type: Sequelize.DATE, allowNull: true },
      createdAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("Referrals", ["referrer_id"]);
    await queryInterface.addIndex("Referrals", ["referred_email"], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Referrals");
    await queryInterface.removeColumn("Users", "referral_code");
    await queryInterface.removeColumn("Users", "referral_rewards_claimed");
  },
};
