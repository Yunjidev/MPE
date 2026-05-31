"use strict";

const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const User     = sequelize.models.User;
const Referral = sequelize.models.Referral;

exports.getReferralStats = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(100, parseInt(req.query.limit) || 25);
    const offset   = (page - 1) * limit;
    const search   = (req.query.search || "").trim().toLowerCase();

    /* Agrégats globaux */
    const totalReferrals  = await Referral.count();
    const validatedCount  = await Referral.count({ where: { validated_at: { [Op.ne]: null } } });
    const pendingCount    = totalReferrals - validatedCount;
    const rewardsIssued   = Math.floor(validatedCount / 5);

    /* Top parrains : parrainage validés par user */
    const topReferrers = await Referral.findAll({
      attributes: [
        "referrer_id",
        [sequelize.fn("COUNT", sequelize.col("Referral.id")), "total"],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN validated_at IS NOT NULL THEN 1 ELSE 0 END")), "validated"],
      ],
      group: ["referrer_id", "referrer.id", "referrer.username", "referrer.email",
              "referrer.firstname", "referrer.lastname", "referrer.referral_code",
              "referrer.referral_rewards_claimed"],
      include: [{
        model: User,
        as: "referrer",
        attributes: ["id", "username", "email", "firstname", "lastname", "referral_code", "referral_rewards_claimed"],
      }],
      order: [[sequelize.literal("validated"), "DESC"]],
      limit: 10,
    });

    /* Liste paginée de tous les parrainages */
    const whereClause = search
      ? { [Op.or]: [
          { referred_email: { [Op.iLike]: `%${search}%` } },
          { "$referrer.email$":    { [Op.iLike]: `%${search}%` } },
          { "$referrer.username$": { [Op.iLike]: `%${search}%` } },
        ]}
      : {};

    const { count, rows } = await Referral.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "referrer",
          attributes: ["id", "username", "email", "firstname", "lastname"],
        },
        {
          model: User,
          as: "referredUser",
          attributes: ["id", "username", "email", "firstname", "lastname"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      stats: {
        total_referrals: totalReferrals,
        validated:       validatedCount,
        pending:         pendingCount,
        rewards_issued:  rewardsIssued,
      },
      top_referrers: topReferrers.map((r) => ({
        user: r.referrer,
        total:     parseInt(r.dataValues.total),
        validated: parseInt(r.dataValues.validated),
        progress:  parseInt(r.dataValues.validated) % 5,
        rewards_claimed: r.referrer?.referral_rewards_claimed || 0,
      })),
      referrals: rows.map((r) => ({
        id:             r.id,
        referred_email: r.referred_email,
        validated:      !!r.validated_at,
        validated_at:   r.validated_at,
        created_at:     r.createdAt,
        referrer:       r.referrer,
        referred_user:  r.referredUser,
      })),
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
