"use strict";

const { sequelize }   = require("../../models/index");
const Message         = sequelize.models.Message;
const MessageReply    = sequelize.models.MessageReply;
const Enterprise      = sequelize.models.Enterprise;
const User            = sequelize.models.User;
const transporter     = require("../../config/mailer");
const rateLimit       = require("express-rate-limit");
const { createNotification } = require("./notification-controller");

const FREE_LIMIT = 5;

exports.messageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: "Trop de messages envoyés. Réessayez dans 10 minutes." },
});

const replyIncludes = [
  { model: MessageReply, as: "replies", order: [["createdAt", "ASC"]] },
  { model: User, as: "user", attributes: ["id", "username", "email", "avatar"] },
];

/* ── POST /enterprise/:slug/messages — public + soft auth ── */
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
      User_id:       req.user?.id || null,
      sender_name:   req.user ? (req.user.username || sender_name.trim()) : sender_name.trim(),
      sender_email:  req.user ? req.user.email : sender_email.trim(),
      sender_phone:  sender_phone?.trim() || null,
      content:       content.trim(),
    });

    if (enterprise.isPremium && enterprise.mail) {
      const isUser = !!req.user;
      try {
        await transporter.sendMail({
          from: `"Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: enterprise.mail,
          subject: `Nouveau message de ${message.sender_name} — Proxilio`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border:1px solid #e0e0de;border-radius:12px">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#879f98;margin-bottom:16px">Proxilio — Nouveau message</p>
<h2 style="font-size:20px;font-weight:400;color:#132A24;margin:0 0 8px">${message.sender_name} vous a envoyé un message</h2>
${isUser ? '<p style="font-size:12px;background:#eef5f1;color:#132A24;padding:6px 12px;border-radius:6px;display:inline-block;margin-bottom:12px">✓ Utilisateur Proxilio inscrit — répondez directement sur la plateforme</p>' : '<p style="font-size:12px;background:#f5f7f6;color:#879f98;padding:6px 12px;border-radius:6px;display:inline-block;margin-bottom:12px">Visiteur sans compte Proxilio — répondez par email : <a href="mailto:${message.sender_email}" style="color:#132A24">${message.sender_email}</a></p>'}
<div style="background:#f5f7f6;border-radius:8px;padding:16px 20px;font-size:14px;color:#132A24;line-height:1.7;white-space:pre-wrap">${content.replace(/</g,"&lt;")}</div>
<p style="margin-top:24px"><a href="https://proxilio.fr/dashboard/enterprise/${enterprise.slug}/messages" style="background:#132A24;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px">Voir dans ma messagerie</a></p>
</div>`,
          text: `${isUser ? "[Utilisateur Proxilio]" : "[Visiteur anonyme]"} ${message.sender_name} (${message.sender_email})\n\n${content}`,
        });
      } catch { /* ne pas bloquer */ }
    }

    /* Notification pour le propriétaire de l'entreprise */
    createNotification({
      User_id: enterprise.User_id,
      type: "message_received",
      title: `Nouveau message de ${message.sender_name}`,
      content: content.slice(0, 120),
      link: `/dashboard/enterprise/${enterprise.slug}/messages`,
    });

    return res.status(201).json({ message: "Message envoyé.", id: message.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};

/* ── GET /enterprise/:slug/messages/unread-count — owner ── */
exports.getEnterpriseUnreadCount = async (req, res) => {
  try {
    const unread = await Message.count({ where: { Enterprise_id: req.enterprise.id, is_read: false, deleted_by_enterprise: false } });
    return res.status(200).json({ unread });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── GET /enterprise/:slug/messages — owner ── */
exports.listMessages = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    const messages = await Message.findAll({
      where: { Enterprise_id: enterprise.id, deleted_by_enterprise: false },
      order: [["createdAt", "DESC"]],
      include: replyIncludes,
    });

    const unread = messages.filter((m) => !m.is_read).length;

    if (!enterprise.isPremium && messages.length > FREE_LIMIT) {
      return res.status(200).json({
        messages: messages.slice(0, FREE_LIMIT),
        total: messages.length, unread, limited: true, freeLimit: FREE_LIMIT,
      });
    }
    return res.status(200).json({ messages, total: messages.length, unread, limited: false, freeLimit: FREE_LIMIT });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── PUT /enterprise/:slug/messages/:messageId/read — owner ── */
exports.markAsRead = async (req, res) => {
  try {
    const msg = await Message.findOne({ where: { id: req.params.messageId, Enterprise_id: req.enterprise.id } });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });
    await msg.update({ is_read: true });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── POST /enterprise/:slug/messages/:messageId/reply — owner ── */
exports.replyToMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Le message est requis." });

    const msg = await Message.findOne({
      where: { id: req.params.messageId, Enterprise_id: req.enterprise.id },
      include: [{ model: User, as: "user", attributes: ["id", "email", "username"] }],
    });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });

    const reply = await MessageReply.create({ Message_id: msg.id, content: content.trim(), sender_type: "enterprise" });

    /* Si l'expéditeur est un user Proxilio → notification email */
    if (msg.User_id && msg.user?.email) {
      try {
        await transporter.sendMail({
          from: `"Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: msg.user.email,
          subject: `${req.enterprise.name} vous a répondu — Proxilio`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border:1px solid #e0e0de;border-radius:12px">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#879f98;margin-bottom:16px">Proxilio — Nouvelle réponse</p>
<h2 style="font-size:20px;font-weight:400;color:#132A24;margin:0 0 12px">${req.enterprise.name} vous a répondu</h2>
<div style="background:#f5f7f6;border-radius:8px;padding:16px 20px;font-size:14px;color:#132A24;line-height:1.7;white-space:pre-wrap">${content.trim().replace(/</g,"&lt;")}</div>
<p style="margin-top:24px"><a href="https://proxilio.fr/dashboard/user-messages" style="background:#132A24;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px">Voir la conversation sur Proxilio</a></p>
</div>`,
          text: `${req.enterprise.name} vous a répondu :\n\n${content.trim()}`,
        });
      } catch { /* ne pas bloquer */ }
    } else if (!msg.User_id) {
      /* Visiteur anonyme — réponse par email direct */
      try {
        await transporter.sendMail({
          from: `"${req.enterprise.name} via Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: msg.sender_email,
          replyTo: req.enterprise.mail || undefined,
          subject: `Réponse de ${req.enterprise.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border:1px solid #e0e0de;border-radius:12px">
<h2 style="font-size:20px;font-weight:400;color:#132A24;margin:0 0 12px">${req.enterprise.name} vous a répondu</h2>
<div style="background:#f5f7f6;border-radius:8px;padding:16px 20px;font-size:14px;color:#132A24;line-height:1.7;white-space:pre-wrap">${content.trim().replace(/</g,"&lt;")}</div>
<p style="margin-top:16px;font-size:12px;color:#aaa">Message transmis via Proxilio — proxilio.fr</p>
</div>`,
          text: `${req.enterprise.name} vous a répondu :\n\n${content.trim()}`,
        });
      } catch { /* ne pas bloquer */ }
    }

    /* Marquer comme non lu côté user */
    if (msg.User_id) await msg.update({ user_unread: true });

    /* Notification pour l'user Proxilio si applicable */
    if (msg.User_id) {
      createNotification({
        User_id: msg.User_id,
        type: "message_reply",
        title: `${req.enterprise.name} vous a répondu`,
        content: content.trim().slice(0, 120),
        link: "/dashboard/user-messages",
      });
    }

    return res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};

/* ── DELETE /enterprise/:slug/messages/:messageId — owner ── */
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findOne({ where: { id: req.params.messageId, Enterprise_id: req.enterprise.id } });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });
    await msg.update({ deleted_by_enterprise: true });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── DELETE /user/messages/:messageId — user ── */
exports.deleteMessageAsUser = async (req, res) => {
  try {
    const msg = await Message.findOne({ where: { id: req.params.messageId, User_id: req.user.id } });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });
    await msg.update({ deleted_by_user: true });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── GET /user/messages/unread-count — user authentifié ── */
exports.getUserUnreadCount = async (req, res) => {
  try {
    const unread = await Message.count({ where: { User_id: req.user.id, user_unread: true, deleted_by_user: false } });
    return res.status(200).json({ unread });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── PUT /user/messages/:messageId/seen — user authentifié ── */
exports.markUserSeen = async (req, res) => {
  try {
    await Message.update({ user_unread: false }, { where: { id: req.params.messageId, User_id: req.user.id } });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── GET /user/messages — user authentifié ── */
exports.listUserMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { User_id: req.user.id, deleted_by_user: false },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Enterprise, as: "enterprise", attributes: ["id", "name", "slug", "logo"] },
        { model: MessageReply, as: "replies", order: [["createdAt", "ASC"]] },
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── POST /user/messages/:messageId/reply — user authentifié ── */
exports.replyAsUser = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Le message est requis." });

    const msg = await Message.findOne({
      where: { id: req.params.messageId, User_id: req.user.id },
      include: [{ model: Enterprise, as: "enterprise", attributes: ["name", "mail", "slug", "isPremium", "User_id"] }],
    });
    if (!msg) return res.status(404).json({ error: "Message introuvable." });

    const reply = await MessageReply.create({ Message_id: msg.id, content: content.trim(), sender_type: "user" });

    /* Marquer comme non lu côté entreprise */
    await msg.update({ is_read: false });

    /* Notifier l'entreprise si Premium */
    if (msg.enterprise?.isPremium && msg.enterprise?.mail) {
      try {
        await transporter.sendMail({
          from: `"Proxilio" <${process.env.EMAIL || "contact@proxilio.fr"}>`,
          to: msg.enterprise.mail,
          subject: `${req.user.username} a répondu à votre message — Proxilio`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border:1px solid #e0e0de;border-radius:12px">
<h2 style="font-size:20px;font-weight:400;color:#132A24;margin:0 0 12px">${req.user.username} vous a répondu</h2>
<div style="background:#f5f7f6;border-radius:8px;padding:16px 20px;font-size:14px;color:#132A24;line-height:1.7;white-space:pre-wrap">${content.trim().replace(/</g,"&lt;")}</div>
<p style="margin-top:24px"><a href="https://proxilio.fr/dashboard/enterprise/${msg.enterprise.slug}/messages" style="background:#132A24;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px">Voir dans ma messagerie</a></p>
</div>`,
          text: `${req.user.username} vous a répondu :\n\n${content.trim()}`,
        });
      } catch { /* ne pas bloquer */ }
    }

    /* Notification pour l'entreprise */
    createNotification({
      User_id: msg.enterprise?.User_id,
      type: "message_received",
      title: `${req.user.username} vous a répondu`,
      content: content.trim().slice(0, 120),
      link: `/dashboard/enterprise/${msg.enterprise?.slug}/messages`,
    });

    return res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};
