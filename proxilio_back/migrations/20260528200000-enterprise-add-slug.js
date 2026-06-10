"use strict";

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Enterprises");
    if (tableInfo.slug) return;

    await queryInterface.addColumn("Enterprises", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });

    // Backfill slugs for existing enterprises
    const [enterprises] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Enterprises"'
    );

    const usedSlugs = new Set();
    for (const e of enterprises) {
      let base = generateSlug(e.name) || "entreprise";
      let slug = base;
      let i = 2;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${i++}`;
      }
      usedSlugs.add(slug);
      await queryInterface.sequelize.query(
        'UPDATE "Enterprises" SET slug = :slug WHERE id = :id',
        { replacements: { slug, id: e.id } }
      );
    }

    await queryInterface.addIndex("Enterprises", ["slug"], {
      unique: true,
      name: "enterprises_slug_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Enterprises", "enterprises_slug_unique").catch(() => {});
    await queryInterface.removeColumn("Enterprises", "slug");
  },
};
