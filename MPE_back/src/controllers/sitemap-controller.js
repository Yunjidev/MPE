const { sequelize } = require("../../models/index");

const STATIC_URLS = [
  { loc: "/",                           changefreq: "weekly",  priority: "1.0" },
  { loc: "/searchentreprise",           changefreq: "daily",   priority: "0.9" },
  { loc: "/pricing",                    changefreq: "monthly", priority: "0.7" },
  { loc: "/FAQ",                        changefreq: "monthly", priority: "0.6" },
  { loc: "/contact",                    changefreq: "yearly",  priority: "0.5" },
  { loc: "/signup",                     changefreq: "yearly",  priority: "0.5" },
  { loc: "/signin",                     changefreq: "yearly",  priority: "0.4" },
  { loc: "/condifentiality-policies",   changefreq: "yearly",  priority: "0.3" },
  { loc: "/usage-policies",             changefreq: "yearly",  priority: "0.3" },
  { loc: "/legal-notices",              changefreq: "yearly",  priority: "0.3" },
  { loc: "/cookie-policies",            changefreq: "yearly",  priority: "0.3" },
];

const BASE_URL = "https://www.proxilio.fr";

exports.getSitemap = async (req, res) => {
  try {
    const Enterprise = sequelize.models.Enterprise;
    const enterprises = await Enterprise.findAll({
      where: { isValidate: true },
      attributes: ["slug", "updatedAt"],
    });

    const now = new Date().toISOString().split("T")[0];

    const staticEntries = STATIC_URLS.map(
      ({ loc, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${now}</lastmod>
  </url>`
    ).join("");

    const enterpriseEntries = enterprises
      .filter((e) => e.slug)
      .map((e) => {
        const lastmod = e.updatedAt
          ? new Date(e.updatedAt).toISOString().split("T")[0]
          : now;
        return `
  <url>
    <loc>${BASE_URL}/enterprise/${e.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${enterpriseEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Sitemap generation failed");
  }
};
