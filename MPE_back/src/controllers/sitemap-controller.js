const { sequelize } = require("../../models/index");
const { generateSlug } = require("../utils/slugify");

const STATIC_URLS = [
  { loc: "/",                         changefreq: "weekly",  priority: "1.0" },
  { loc: "/professionnels",           changefreq: "daily",   priority: "0.9" },
  { loc: "/blog",                     changefreq: "weekly",  priority: "0.8" },
  { loc: "/a-propos",                 changefreq: "monthly", priority: "0.5" },
  { loc: "/pricing",                  changefreq: "monthly", priority: "0.7" },
  { loc: "/faq",                      changefreq: "monthly", priority: "0.6" },
  { loc: "/contact",                  changefreq: "yearly",  priority: "0.5" },
  { loc: "/signup",                   changefreq: "yearly",  priority: "0.5" },
  { loc: "/signin",                   changefreq: "yearly",  priority: "0.4" },
  { loc: "/confidentiality-policies", changefreq: "yearly",  priority: "0.3" },
  { loc: "/usage-policies",           changefreq: "yearly",  priority: "0.3" },
  { loc: "/legal-notices",            changefreq: "yearly",  priority: "0.3" },
  { loc: "/cookie-policies",          changefreq: "yearly",  priority: "0.3" },
];

const BLOG_SLUGS = [
  "comment-choisir-un-bon-artisan",
  "devis-travaux-ce-qu-il-faut-verifier",
  "reservation-en-ligne-artisan-avantages",
  "verifier-professionnel-avant-de-lui-faire-confiance",
  "professionnel-independant-vs-grande-entreprise",
];

const BASE_URL = "https://proxilio.fr";

exports.getSitemap = async (req, res) => {
  try {
    const Enterprise  = sequelize.models.Enterprise;
    const Job         = sequelize.models.Job;

    const [enterprises, jobs] = await Promise.all([
      Enterprise.findAll({
        where: { isValidate: true },
        attributes: ["slug", "city", "updatedAt"],
        include: [{ model: Job, as: "job", attributes: ["name"] }],
      }),
      Job.findAll({ attributes: ["name"] }),
    ]);

    const now = new Date().toISOString().split("T")[0];

    const url = (loc, changefreq, priority, lastmod = now) => `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;

    const staticEntries   = STATIC_URLS.map(({ loc, changefreq, priority }) => url(loc, changefreq, priority)).join("");
    const blogEntries     = BLOG_SLUGS.map((s) => url(`/blog/${s}`, "monthly", "0.7")).join("");
    const enterpriseEntries = enterprises
      .filter((e) => e.slug)
      .map((e) => url(`/enterprise/${e.slug}`, "weekly", "0.8", e.updatedAt ? new Date(e.updatedAt).toISOString().split("T")[0] : now))
      .join("");

    // Pages par métier
    const jobSlugs = [...new Set(jobs.map((j) => generateSlug(j.name)).filter(Boolean))];
    const jobEntries = jobSlugs.map((s) => url(`/professionnels/${s}`, "weekly", "0.7")).join("");

    // Pages métier × ville (combinaisons existantes)
    const combos = new Set();
    enterprises.forEach((e) => {
      if (e.job?.name && e.city) {
        combos.add(`${generateSlug(e.job.name)}/${generateSlug(e.city)}`);
      }
    });
    const comboEntries = [...combos].map((c) => url(`/professionnels/${c}`, "weekly", "0.7")).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${blogEntries}${enterpriseEntries}${jobEntries}${comboEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Sitemap generation failed");
  }
};
