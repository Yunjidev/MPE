"use strict";

const { sequelize } = require("../../models/index");
const Notification  = sequelize.models.Notification;

/* ── Créer une notification (usage interne) ── */
exports.createNotification = async ({ User_id, type, title, content, link }) => {
  if (!User_id) return;
  try {
    await Notification.create({ User_id, type, title, content: content || null, link: link || null });
  } catch (e) { console.error("[Notification] Erreur création:", e.message); }
};

/* ── GET /user/notifications ── */
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { User_id: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 30,
    });
    const unread = notifications.filter((n) => !n.is_read).length;
    return res.status(200).json({ notifications, unread });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── PUT /user/notifications/:id/read ── */
exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { id: req.params.notifId, User_id: req.user.id } });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

/* ── PUT /user/notifications/read-all ── */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { User_id: req.user.id, is_read: false } });
    return res.status(200).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};
