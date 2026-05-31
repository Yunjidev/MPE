"use strict";

const { sequelize } = require("../../../models/index");
const { generateSlug } = require("../../utils/slugify");
const files = require("../../utils/files");
const { calculateAverageRatingForEnterprise } = require("../../utils/ratings");

const Enterprise = sequelize.models.Enterprise;
const Job        = sequelize.models.Job;

// GET /api/jobs-with-count — liste des métiers avec le nombre d'entreprises validées
exports.getJobsWithCount = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{
        model: Enterprise,
        as: "Enterprises",
        where: { isValidate: true },
        attributes: [],
        required: false,
      }],
      attributes: [
        "id", "name", "picture",
        [sequelize.fn("COUNT", sequelize.col("Enterprises.id")), "count"],
      ],
      group: ["Job.id"],
      order: [[sequelize.literal('"count"'), "DESC"]],
    });
    res.json(jobs.map((j) => ({
      id: j.id,
      name: j.name,
      slug: generateSlug(j.name),
      count: parseInt(j.dataValues.count) || 0,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// GET /api/enterprises/by-job/:jobSlug[?city=:citySlug]
exports.getByJob = async (req, res) => {
  try {
    const { jobSlug } = req.params;
    const citySlug = req.query.city || null;

    const enterprises = await Enterprise.findAll({
      where: { isValidate: true },
      include: [
        { model: Job, as: "job", attributes: ["id", "name"] },
        { model: sequelize.models.Country, as: "country", attributes: ["name"] },
        {
          model: sequelize.models.Offer, as: "offers",
          include: [{ model: sequelize.models.Rating, as: "ratings", attributes: ["rating"] }],
          attributes: ["id"],
          required: false,
        },
        {
          model: sequelize.models.Subscription, as: "subscriptions",
          where: { status: "active" }, attributes: ["id"], required: false, separate: true,
        },
      ],
    });

    const matched = enterprises.filter((e) => {
      if (!e.job) return false;
      if (generateSlug(e.job.name) !== jobSlug) return false;
      if (citySlug && generateSlug(e.city || "") !== citySlug) return false;
      return true;
    });

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

    // Premium d'abord, puis par note
    result.sort((a, b) => {
      if (a.isPremium !== b.isPremium) return b.isPremium ? 1 : -1;
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

    const jobName = matched[0]?.job?.name || null;
    const cities  = [...new Set(matched.map((e) => e.city).filter(Boolean))].sort();

    res.json({ jobName, jobSlug, citySlug, enterprises: result, cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
