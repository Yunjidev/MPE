const { Op } = require("sequelize");

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

async function ensureUniqueSlug(name, Enterprise, excludeId = null) {
  const base = generateSlug(name);
  let slug = base || "entreprise";
  let i = 2;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Enterprise.findOne({ where });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

module.exports = { generateSlug, ensureUniqueSlug };
