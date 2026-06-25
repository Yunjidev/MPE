"use strict";

const { sequelize } = require("../../../models/index");
const { generateSlug } = require("../../utils/slugify");
const files = require("../../utils/files");
const { calculateAverageRatingForEnterprise } = require("../../utils/ratings");

const Enterprise = sequelize.models.Enterprise;
const Job        = sequelize.models.Job;

// GET /api/enterprises/by-city/:citySlug
exports.getByCity = async (req, res) => {
  try {
    const { citySlug } = req.params;

    const enterprises = await Enterprise.findAll({
      where: { isValidate: true },
      include: [
        { model: Job, as: "job", attributes: ["id", "name"] },
        {
          model: sequelize.models.Offer, as: "offers",
          include: [{ model: sequelize.models.Rating, as: "ratings", attributes: ["note"] }],
          attributes: ["id"],
          required: false,
        },
        {
          model: sequelize.models.Subscription, as: "subscriptions",
          where: { status: "active" }, attributes: ["id"], required: false, separate: true,
        },
      ],
    });

    const matched = enterprises.filter((e) =>
      generateSlug(e.city || "") === citySlug
    );

    const result = await Promise.all(matched.map(async (e) => {
      const avg = await calculateAverageRatingForEnterprise(e.id);
      const isPremium = (e.subscriptions || []).length > 0;
      return {
        id: e.id,
        slug: e.slug,
        name: e.name,
        city: e.city,
        zip_code: e.zip_code,
        description: e.description,
        logo: e.logo ? files.getUrl(req, "enterprises/logo", e.logo) : null,
        isPremium,
        job: e.job,
        averageRating: avg,
        reviewCount: (e.offers || []).reduce((s, o) => s + (o.ratings?.length || 0), 0),
      };
    }));

    result.sort((a, b) => {
      if (a.isPremium !== b.isPremium) return b.isPremium ? 1 : -1;
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

    const cityName = matched[0]?.city || null;
    const jobs = [...new Set(matched.map((e) => e.job?.name).filter(Boolean))].sort();

    res.json({ cityName, citySlug, enterprises: result, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
