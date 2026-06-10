"use strict";

const crypto    = require("crypto");
const { sequelize } = require("../../models/index");
const Enterprise = sequelize.models.Enterprise;
const sendEmail  = require("../mailers/email-service");

function generateCode() {
  return crypto.randomInt(100000, 999999).toString(); // 6 chiffres
}

/* ── POST /enterprise/:slug/initiate-claim ── authentifié ── */
exports.initiateClaim = async (req, res) => {
  try {
    const enterprise = await Enterprise.findOne({ where: { slug: req.params.slug, isValidate: true } });
    if (!enterprise) return res.status(404).json({ error: "Entreprise introuvable." });
    if (enterprise.is_claimed) return res.status(409).json({ error: "Cette fiche est déjà revendiquée." });

    const mail = enterprise.mail || enterprise.claim_mail;
    if (!mail) return res.status(422).json({
      error: "Cette fiche ne comporte pas d'adresse email professionnelle vérifiable. Contactez le support.",
    });

    const code    = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    enterprise.claim_token            = code;
    enterprise.claim_token_expires_at = expires;
    enterprise.claim_mail             = mail;
    await enterprise.save();

    // Associer provisoirement l'utilisateur (il devra valider avec le code)
    // On stocke l'intention sans toucher User_id pour l'instant

    try {
      await sendEmail(
        mail,
        `Code de vérification Proxilio — ${enterprise.name}`,
        "claim-verification",
        {
          enterprise: enterprise.name,
          code,
          username:   req.user.username,
          expires:    "15 minutes",
        }
      );
    } catch (mailErr) {
      console.error("Erreur envoi email claim:", mailErr);
      return res.status(500).json({ error: "Impossible d'envoyer l'email de vérification. Vérifiez l'adresse email de l'entreprise." });
    }

    res.json({
      ok:        true,
      mail_hint: mail.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
      message:   "Code envoyé ! Consultez la boîte email professionnelle de votre entreprise.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── POST /enterprise/:slug/verify-claim ── authentifié ── */
exports.verifyClaim = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code?.trim()) return res.status(400).json({ error: "Code requis." });

    const enterprise = await Enterprise.findOne({ where: { slug: req.params.slug, isValidate: true } });
    if (!enterprise) return res.status(404).json({ error: "Entreprise introuvable." });
    if (enterprise.is_claimed) return res.status(409).json({ error: "Cette fiche est déjà revendiquée." });

    if (!enterprise.claim_token) return res.status(400).json({
      error: "Aucun code envoyé. Initiez d'abord une revendication.",
    });

    if (enterprise.claim_token_expires_at < new Date()) return res.status(410).json({
      error: "Le code a expiré. Demandez un nouveau code.",
    });

    if (enterprise.claim_token !== code.trim()) return res.status(401).json({
      error: "Code incorrect.",
    });

    // Validation réussie
    enterprise.User_id                  = req.user.id;
    enterprise.is_claimed               = true;
    enterprise.claim_token              = null;
    enterprise.claim_token_expires_at   = null;
    // Marquer l'user comme entrepreneur
    if (!req.user.isEntrepreneur) {
      req.user.isEntrepreneur = true;
      await req.user.save();
    }
    await enterprise.save();

    res.json({
      ok:      true,
      message: "Fiche revendiquée avec succès ! Vous êtes maintenant propriétaire de cette entreprise.",
      slug:    enterprise.slug,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── POST /enterprise/:slug/resend-claim ── authentifié ── */
exports.resendClaim = async (req, res) => {
  try {
    const enterprise = await Enterprise.findOne({ where: { slug: req.params.slug, isValidate: true } });
    if (!enterprise) return res.status(404).json({ error: "Entreprise introuvable." });
    if (enterprise.is_claimed) return res.status(409).json({ error: "Cette fiche est déjà revendiquée." });

    const mail = enterprise.claim_mail || enterprise.mail;
    if (!mail) return res.status(422).json({ error: "Aucune adresse email disponible pour cette fiche." });

    const code    = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    enterprise.claim_token            = code;
    enterprise.claim_token_expires_at = expires;
    await enterprise.save();

    try {
      await sendEmail(
        mail,
        `Nouveau code de vérification Proxilio — ${enterprise.name}`,
        "claim-verification",
        { enterprise: enterprise.name, code, username: req.user.username, expires: "15 minutes" }
      );
    } catch {
      return res.status(500).json({ error: "Impossible d'envoyer l'email." });
    }

    res.json({
      ok:        true,
      mail_hint: mail.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
      message:   "Nouveau code envoyé.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
