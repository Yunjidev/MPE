"use strict";

const { sequelize } = require("../../models/index");
const SiteSetting = sequelize.models.SiteSetting;

exports.getBanner = async (req, res) => {
  try {
    const [enabled, text] = await Promise.all([
      SiteSetting.findByPk("banner_enabled"),
      SiteSetting.findByPk("banner_text"),
    ]);
    res.json({
      enabled: enabled?.value === "true",
      text: text?.value || "",
    });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};

exports.updateBanner = async (req, res) => {
  try {
    const { enabled, text } = req.body;
    await SiteSetting.upsert({ key: "banner_enabled", value: String(!!enabled) });
    if (text !== undefined) {
      await SiteSetting.upsert({ key: "banner_text", value: String(text) });
    }
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur serveur." }); }
};
