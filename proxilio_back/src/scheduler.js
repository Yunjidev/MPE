const cron = require("node-cron");
const { Op } = require("sequelize");
const { sequelize } = require("../models/index");

// Chaque nuit à minuit : désactiver les abonnements expirés et révoquer isPremium
cron.schedule("0 0 * * *", async () => {
  try {
    const Subscription = sequelize.models.Subscription;
    const Enterprise = sequelize.models.Enterprise;
    const now = new Date();

    const expired = await Subscription.findAll({
      where: { status: "active", end_date: { [Op.lt]: now } },
    });

    if (expired.length === 0) return;

    const enterpriseIds = [...new Set(expired.map((s) => s.Enterprise_id))];

    await Subscription.update(
      { status: "inactive" },
      { where: { id: expired.map((s) => s.id) } }
    );

    for (const enterpriseId of enterpriseIds) {
      const stillActive = await Subscription.count({
        where: { Enterprise_id: enterpriseId, status: "active" },
      });
      if (stillActive === 0) {
        await Enterprise.update(
          { isPremium: false },
          { where: { id: enterpriseId } }
        );
      }
    }

    console.log(
      `[CRON] ${expired.length} abonnement(s) expiré(s) désactivé(s) pour ${enterpriseIds.length} entreprise(s)`
    );
  } catch (err) {
    console.error("[CRON] Erreur lors de la vérification des abonnements expirés:", err);
  }
});
