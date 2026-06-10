const { body, validationResult } = require("express-validator");
const transporter = require("../../config/mailer");

const contactLimiter = require("express-rate-limit")({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: "Trop de messages envoyés, réessayez dans 1 heure." },
});

const contactValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
  body("subject").trim().isLength({ min: 2, max: 150 }).escape().withMessage("Objet invalide"),
  body("message").trim().isLength({ min: 10, max: 5000 }).escape().withMessage("Message trop court ou trop long"),
];

const sendContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, subject, message } = req.body;
  const to = process.env.EMAIL || "contact@proxilio.fr";

  try {
    await transporter.sendMail({
      from: `"Proxilio Contact" <${to}>`,
      to,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: `Message de : ${email}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f5f7f6;border-radius:16px;">
          <h2 style="color:#132A24;font-weight:300;margin:0 0 24px">Nouveau message via le formulaire de contact</h2>
          <p style="margin:0 0 8px;color:#879f98;font-size:13px;">De :</p>
          <p style="margin:0 0 24px;color:#132A24;">${email}</p>
          <p style="margin:0 0 8px;color:#879f98;font-size:13px;">Objet :</p>
          <p style="margin:0 0 24px;color:#132A24;">${subject}</p>
          <p style="margin:0 0 8px;color:#879f98;font-size:13px;">Message :</p>
          <div style="background:white;border-radius:12px;padding:20px;color:#132A24;white-space:pre-wrap;">${message}</div>
          <p style="margin:24px 0 0;font-size:12px;color:#879f98;">Proxilio · contact@proxilio.fr</p>
        </div>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact mail error:", err.message);
    res.status(500).json({ errors: "Erreur lors de l'envoi du message." });
  }
};

module.exports = { sendContact, contactLimiter, contactValidation };
