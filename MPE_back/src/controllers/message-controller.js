"use strict";

const { sequelize }  = require("../../models/index");
const Message        = sequelize.models.Message;
const Enterprise     = sequelize.models.Enterprise;
const transporter    = require("../../config/mailer");
const rateLimit      = require("express-rate-limit");

const FREE_LIMIT = 5;

/* Rate limiter : max 3 messages par IP toutes les 10 minutes */
exports.messageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: "Trop de messages envoyés. Réessayez dans 10 minutes." },
});

/* POST /enterprise/:slug/messages — public */
exports.sendMessage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { sender_name, sender_email, sender_phone, content } = req.body;

    if (!sender_name?.trim() || !sender_email?.trim() || !content?.trim())
      return res.status(400).json({ error: "Nom, email et message sont requis." });

    const enterprise = await Enterprise.findOne({ where: { slug, isValidate: true } });
    if (!enterprise) return res.status(404).json({ error: "Entreprise introuvable." });

    const message = await Message.create({
      Enterprise_id: enterprise.id,
      sender_name:  sender_name.trim(),
      sender_email: sender_email.trim(),
      sender_phone: sender_phone?.trim() || null,
      content:      content.trim(),
    });

    /* Notification email si Premium */
    if (enterprise.isPremium && enterprise.mail) {
      try {
        await transporter.sendMail({
          from: `"Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: enterprise.mail,
          subject: `Nouveau message de ${sender_name} — Proxilio`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border:1px solid #e0e0de;border-radius:12px">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#879f98;margin-bottom:16px">Proxilio — Nouveau message</p>
<h2 style="font-size:20px;font-weight:400;color:#132A24;margin:0 0 8px">${sender_name} vous a envoyé un message</h2>
<p style="font-size:13px;color:#555;margin-bottom:20px">Répondez directement à <a href="mailto:${sender_email}" style="color:#132A24">${sender_email}</a>${sender_phone ? ` · ${sender_phone}` : ""}</p>
<div style="background:#f5f7f6;border-radius:8px;padding:16px 20px;font-size:14px;color:#132A24;line-height:1.7;white-space:pre-wrap">${content.replace(/</g,"&lt;")}</div>
<p style="margin-top:24px;font-size:12px;color:#aaa">Consultez votre boîte de réception sur <a href="https://proxilio.fr/dashboard" style="color:#132A24">proxilio.fr</a></p>
</div>`,
          text: `Nouveau message de ${sender_name} (${sender_email})\n\n${content}`,
        });
      } catch { /* ne pas bloquer si l'email échoue */ }
    }

    return res.status(201).json({ message: "Message envoyé.", id: message.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};

/* GET /enterprise/:slug/messages — owner */
exports.listMessages = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    const messages   = await Message.findAll({
      where: { Enterprise_id: enterprise.id },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "sender_name", "sender_email", "sender_phone", "content", "is_read", "createdAt"],
    });

    const unread = messages.filter((m) => !m.is_read).length;

    if (!enterprise.isPremium && messages.length > FREE_LIMIT) {
      return res.status(200).json({
        messages: messages.slice(0, FREE_LIMIT),
        total: messages.length,
        unread,
        limited: true,
        freeLimit: FREE_LIMIT,
      });
    }

    return res.status(200).json({ messages, total: messages.length, unread, limited: false, freeLimit: FREE_LIMIT });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* PUT /enterprise/:slug/messages/:id/read — owner */
exports.markAsRead = async (req, res) => {
  try {
    const msg = await Message.findOne({
      where: { id: req.params.messageId, Enterprise_id: req.enterprise.id },
    });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });
    await msg.update({ is_read: true });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* DELETE /enterprise/:slug/messages/:id — owner */
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findOne({
      where: { id: req.params.messageId, Enterprise_id: req.enterprise.id },
    });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });
    await msg.destroy();
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};
