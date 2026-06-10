"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SiteSettings", {
      key:   { type: Sequelize.STRING(100), primaryKey: true, allowNull: false },
      value: { type: Sequelize.TEXT, allowNull: true },
    });
    await queryInterface.bulkInsert("SiteSettings", [
      { key: "banner_enabled", value: "true" },
      { key: "banner_text",    value: "🎉 Offre de lancement : les 10 premiers professionnels bénéficient du Premium gratuitement pendant 1 mois." },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("SiteSettings");
  },
};
