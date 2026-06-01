"use strict";

const fs           = require("fs");
const path         = require("path");
const nodemailer   = require("nodemailer");
const { sequelize } = require("../../../models/index");

/* Transporter dédié Brevo — uniquement pour les emails marketing */
const brevoTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const TEMPLATES_FILE = path.join(__dirname, "../data/marketing-templates.json");

function readTemplates() {
  try { return JSON.parse(fs.readFileSync(TEMPLATES_FILE, "utf-8")); }
  catch { return []; }
}

function writeTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), "utf-8");
}

function nextId(templates) {
  return templates.length ? Math.max(...templates.map((t) => t.id)) + 1 : 1;
}

/* ── CRUD templates ── */

exports.getTemplates = (req, res) => {
  return res.status(200).json(readTemplates());
};

exports.createTemplate = (req, res) => {
  const { name, subject, body } = req.body;
  if (!name?.trim() || !subject?.trim() || !body?.trim())
    return res.status(400).json({ error: "Nom, sujet et corps sont requis." });
  const templates = readTemplates();
  const tpl = { id: nextId(templates), name: name.trim(), subject: subject.trim(), body: body.trim() };
  templates.push(tpl);
  writeTemplates(templates);
  return res.status(201).json(tpl);
};

exports.updateTemplate = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, subject, body } = req.body;
  const templates = readTemplates();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Template introuvable." });
  templates[idx] = { ...templates[idx], ...(name && { name }), ...(subject && { subject }), ...(body && { body }) };
  writeTemplates(templates);
  return res.status(200).json(templates[idx]);
};

exports.deleteTemplate = (req, res) => {
  const id = parseInt(req.params.id);
  const templates = readTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return res.status(404).json({ error: "Template introuvable." });
  writeTemplates(filtered);
  return res.status(200).json({ message: "Template supprimé." });
};

/* ── Segments ── */

exports.getUsersWithoutEnterprise = async (req, res) => {
  try {
    const User = sequelize.models.User;
    const users = await User.findAll({
      attributes: ["email"],
      include: [{ model: sequelize.models.Enterprise, as: "enterprises", attributes: ["id"] }],
    });
    const emails = users.filter((u) => u.enterprises.length === 0).map((u) => u.email);
    return res.status(200).json({ emails });
  } catch (error) {
    console.error("[Marketing] getUsersWithoutEnterprise:", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

/* ── Envoi marketing ── */

function mdToHtml(md) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0de;margin:20px 0"/>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:500;color:#132A24;margin:18px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:400;color:#132A24;margin:0 0 16px">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#132A24">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul style="padding-left:20px;margin:10px 0">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:10px 0">')
    .replace(/\n/g, "<br/>");
}

exports.sendMarketing = async (req, res) => {
  try {
    const { subject, body, emails } = req.body;
    if (!subject?.trim() || !body?.trim() || !emails?.length)
      return res.status(400).json({ error: "Sujet, corps et liste d'emails sont requis." });

    const list = emails.map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (!list.length) return res.status(400).json({ error: "Aucune adresse e-mail valide." });

    const htmlContent = mdToHtml(body);
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f6;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#132A24;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
<p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#879f98;font-weight:300;">Proxilio</p>
</td></tr>
<tr><td style="background:#fff;padding:32px 40px;font-size:14px;font-weight:300;color:#132A24;line-height:1.8;">
<p style="margin:0 0 10px">${htmlContent}</p>
</td></tr>
<tr><td style="background:#f5f7f6;border-radius:0 0 16px 16px;padding:16px 40px;text-align:center;border-top:1px solid #eaede9;">
<p style="margin:0;font-size:11px;color:#aaa;font-weight:300;">Proxilio — <a href="https://proxilio.fr" style="color:#132A24;">proxilio.fr</a> · Pour ne plus recevoir ces emails, contactez-nous.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    const plain = body.replace(/[#*_\-`]/g, "").replace(/\n\n+/g, "\n\n");
    const FROM = `"Proxilio" <contact@proxilio.fr>`;
    const BATCH = 50;
    const DELAY = 1500;

    /* Répondre immédiatement — l'envoi continue en arrière-plan */
    res.status(200).json({ message: `Envoi lancé pour ${list.length} destinataire(s). Les emails partent en arrière-plan.`, total: list.length });

    setImmediate(async () => {
      let sent = 0, failed = 0;
      for (let i = 0; i < list.length; i += BATCH) {
        const batch = list.slice(i, i + BATCH);
        await Promise.allSettled(
          batch.map((email) =>
            brevoTransporter.sendMail({ from: FROM, to: email, subject, html, text: plain })
              .then(() => { sent++; })
              .catch((e) => { failed++; console.error(`[Marketing] Échec ${email}:`, e.message); })
          )
        );
        if (i + BATCH < list.length) await new Promise((r) => setTimeout(r, DELAY));
      }
      console.log(`[Marketing] Envoi terminé : ${sent} OK, ${failed} échoués sur ${list.length}`);
    });

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};
