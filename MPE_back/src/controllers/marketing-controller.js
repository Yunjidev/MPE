"use strict";

const transporter = require("../../config/mailer");

const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: "Présentation Proxilio",
    subject: "Découvrez Proxilio — Référencez votre entreprise gratuitement",
    body: `Bonjour,

Nous vous contactons pour vous présenter Proxilio, la plateforme qui référence les professionnels du bâtiment et de l'artisanat en France.

🔍 Pourquoi rejoindre Proxilio ?

• Visibilité gratuite : créez votre fiche entreprise et soyez trouvé par des milliers de clients potentiels près de chez vous.
• Référencement Google : les profils Proxilio remontent dans les résultats de recherche Google.
• Réservation en ligne : vos clients prennent rendez-vous directement depuis votre profil, 24h/24.
• Badge de confiance : un badge certifié renforce votre crédibilité auprès des particuliers.
• Devis & Factures PDF : créez et envoyez vos devis et factures professionnels depuis la plateforme.

💡 C'est gratuit pour commencer !

Inscrivez-vous sur proxilio.fr et créez votre fiche en quelques minutes.

L'équipe Proxilio — proxilio.fr`,
  },
  {
    id: 2,
    name: "Offre Premium",
    subject: "Passez Premium sur Proxilio — 10 €/mois, sans engagement",
    body: `Bonjour,

Votre profil est déjà en ligne sur Proxilio. Saviez-vous que l'offre Premium peut multiplier votre visibilité ?

⭐ Ce que vous gagnez avec Premium :

• Mise en avant sur la page d'accueil — affiché en premier avant vos concurrents
• Priorisation dans les résultats de recherche
• Badge de certification officiel
• Calendrier de réservation en ligne
• Statistiques avancées
• Création de devis et factures PDF professionnels
• Référencement prioritaire sur Google

💰 Tarifs :
• Mensuel : 10 €/mois, sans engagement
• Annuel : 100 €/an (2 mois offerts)

👉 Passez Premium sur proxilio.fr/pricing

L'équipe Proxilio`,
  },
  {
    id: 3,
    name: "Référencement Google",
    subject: "Votre entreprise n'apparaît pas sur Google ? Proxilio peut changer ça",
    body: `Bonjour,

Aujourd'hui, 90 % des particuliers cherchent un artisan sur Google avant de contacter quelqu'un.

Si votre entreprise n'apparaît pas dans les premiers résultats, vous perdez des clients chaque jour.

Proxilio vous aide à être visible :

✅ Votre fiche Proxilio remonte dans les résultats Google
✅ Vos clients vous trouvent avant vos concurrents
✅ Avis vérifiés qui renforcent votre réputation en ligne
✅ Réservation en ligne intégrée

Créez votre fiche gratuite sur proxilio.fr

À bientôt,
L'équipe Proxilio`,
  },
];

exports.getTemplates = async (req, res) => {
  return res.status(200).json(DEFAULT_TEMPLATES);
};

exports.sendMarketing = async (req, res) => {
  try {
    const { subject, body, emails } = req.body;
    if (!subject?.trim() || !body?.trim() || !emails?.length) {
      return res.status(400).json({ error: "Sujet, corps et liste d'emails sont requis." });
    }

    const list = emails.map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (!list.length) return res.status(400).json({ error: "Aucune adresse e-mail valide." });

    const htmlBody = body.replace(/\n/g, "<br/>").replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f6;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#132A24;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
<p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#879f98;font-weight:300;">Proxilio</p>
<h1 style="margin:8px 0 0;font-size:20px;font-weight:300;color:#fff;letter-spacing:-0.5px;">${subject}</h1>
</td></tr>
<tr><td style="background:#fff;padding:32px 40px;font-size:14px;font-weight:300;color:#132A24;line-height:1.8;">
${htmlBody}
</td></tr>
<tr><td style="background:#f5f7f6;border-radius:0 0 16px 16px;padding:16px 40px;text-align:center;border-top:1px solid #eaede9;">
<p style="margin:0;font-size:11px;color:#aaa;font-weight:300;">Proxilio — <a href="https://proxilio.fr" style="color:#132A24;">proxilio.fr</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    let sent = 0;
    let failed = 0;
    for (const email of list) {
      try {
        await transporter.sendMail({
          from: `"Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: email,
          subject,
          html,
          text: body,
        });
        sent++;
      } catch { failed++; }
    }

    return res.status(200).json({ message: `Email envoyé à ${sent} destinataire(s).`, sent, failed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};
