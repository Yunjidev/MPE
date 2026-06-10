"use strict";

const crypto  = require("crypto");
const { sequelize } = require("../../models/index");
const User      = sequelize.models.User;
const Referral  = sequelize.models.Referral;
const Enterprise = sequelize.models.Enterprise;

/* domaines jetables bloqués */
const BLOCKED_DOMAINS = [
  "mailinator.com","tempmail.com","10minutemail.com","guerrillamail.com",
  "throwaway.email","yopmail.com","fakeinbox.com","trashmail.com",
  "mailnull.com","spamgourmet.com","dispostable.com","sharklasers.com",
  "spam4.me","grr.la","guerrillamailblock.com","gecici.ml",
];

function isBlockedDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
}

function generateCode() {
  return crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 chars
}

/* Étend le premium d'une entreprise de 30 jours */
async function grantPremiumMonth(userId) {
  const enterprise = await Enterprise.findOne({ where: { User_id: userId, isValidate: true } });
  if (!enterprise) return;

  const now = new Date();
  const base = enterprise.premiumManualEnd && enterprise.premiumManualEnd > now
    ? new Date(enterprise.premiumManualEnd)
    : now;
  base.setDate(base.getDate() + 30);

  enterprise.premiumManualEnd   = base;
  enterprise.premiumManualStart = enterprise.premiumManualStart || now;
  enterprise.isPremium = true;
  await enterprise.save();
}

/* ── GET /user/referral ── */
exports.getStats = async (req, res) => {
  try {
    const user = req.user;

    /* générer un code si absent */
    if (!user.referral_code) {
      let code, exists = true;
      while (exists) {
        code  = generateCode();
        exists = await User.findOne({ where: { referral_code: code } });
      }
      user.referral_code = code;
      await user.save();
    }

    /* Valider les parrainages en attente (via lien) qui remplissent maintenant les critères */
    const pendingReferrals = await Referral.findAll({
      where: { referrer_id: user.id, validated_at: null },
    });
    for (const ref of pendingReferrals) {
      const referred = await User.findByPk(ref.referred_user_id);
      if (!referred) continue;
      const ageMins = (Date.now() - new Date(referred.createdAt).getTime()) / 60000;
      if (ageMins >= 48 * 60 && referred.firstname && referred.lastname) {
        ref.validated_at = new Date();
        await ref.save();
      }
    }

    const referrals = await Referral.findAll({
      where: { referrer_id: user.id },
      order: [["createdAt", "DESC"]],
    });

    const validated = referrals.filter((r) => r.validated_at);
    const pending   = referrals.filter((r) => !r.validated_at);

    /* progrès vers prochain palier */
    const totalValidated     = validated.length;
    const rewardsEarned      = Math.floor(totalValidated / 5);
    const rewardsClaimed     = user.referral_rewards_claimed || 0;
    const rewardsDue         = rewardsEarned - rewardsClaimed;

    /* déclencher les récompenses en retard (ex : rechargement de page) */
    if (rewardsDue > 0) {
      for (let i = 0; i < rewardsDue; i++) await grantPremiumMonth(user.id);
      user.referral_rewards_claimed = rewardsEarned;
      await user.save();
    }

    const progressInCurrentBatch = totalValidated % 5; // 0-4

    res.json({
      referral_code:     user.referral_code,
      referral_link:     `${process.env.CLIENT_URL}/signup?ref=${user.referral_code}`,
      total_validated:   totalValidated,
      rewards_earned:    rewardsEarned,
      progress:          progressInCurrentBatch,   // X/5
      pending_count:     pending.length,
      referrals: referrals.map((r) => ({
        email:        r.referred_email,
        validated:    !!r.validated_at,
        validated_at: r.validated_at,
        created_at:   r.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── POST /user/referral/claim ── */
exports.claimReferral = async (req, res) => {
  try {
    const referrer = req.user;
    const email    = (req.body.email || "").trim().toLowerCase();

    if (!email) return res.status(400).json({ error: "Email requis." });

    /* 1. Domaine jetable */
    if (isBlockedDomain(email))
      return res.status(400).json({ error: "Ce domaine email n'est pas accepté." });

    /* 2. Pas son propre email */
    if (email === referrer.email.toLowerCase())
      return res.status(400).json({ error: "Vous ne pouvez pas vous parrainer vous-même." });

    /* 3. Pas déjà revendiqué globalement */
    const existing = await Referral.findOne({ where: { referred_email: email } });
    if (existing)
      return res.status(409).json({ error: "Cet email a déjà été utilisé dans un parrainage." });

    /* 4. Le filleul a un compte */
    const referred = await User.findOne({ where: { email } });
    if (!referred)
      return res.status(404).json({ error: "Aucun compte Proxilio trouvé pour cet email." });

    /* 5. Profil complet (prénom + nom) */
    if (!referred.firstname || !referred.lastname)
      return res.status(422).json({ error: "Le compte de ce filleul est incomplet (prénom/nom manquants). Demandez-lui de compléter son profil." });

    /* 6. Ancienneté 48h */
    const ageMins = (Date.now() - new Date(referred.createdAt).getTime()) / 60000;
    if (ageMins < 48 * 60)
      return res.status(422).json({ error: "Ce compte a été créé il y a moins de 48h. Réessayez dans quelques jours." });

    /* 7. Créer la validation */
    await Referral.create({
      referrer_id:      referrer.id,
      referred_email:   email,
      referred_user_id: referred.id,
      validated_at:     new Date(),
    });

    /* 8. Vérifier si récompense due */
    const totalValidated = await Referral.count({
      where: { referrer_id: referrer.id, validated_at: { [require("sequelize").Op.ne]: null } },
    });
    const rewardsEarned  = Math.floor(totalValidated / 5);
    const rewardsClaimed = referrer.referral_rewards_claimed || 0;

    if (rewardsEarned > rewardsClaimed) {
      await grantPremiumMonth(referrer.id);
      referrer.referral_rewards_claimed = rewardsEarned;
      await referrer.save();
      return res.json({
        ok: true,
        rewarded: true,
        total_validated: totalValidated,
        progress: totalValidated % 5,
        message: "🎉 Parrainage validé ! Vous venez de gagner 1 mois de Premium gratuit.",
      });
    }

    res.json({
      ok: true,
      rewarded: false,
      total_validated: totalValidated,
      progress: totalValidated % 5,
      message: `Parrainage validé ! (${totalValidated % 5 || 5}/5 vers votre prochain mois gratuit)`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
