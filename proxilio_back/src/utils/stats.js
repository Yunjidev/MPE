const { Op } = require("sequelize");
const { sequelize } = require("../../models/index");

async function getUserLength() {
  const users = await sequelize.models.User.findAll({
    attributes: ["id"],
  });
  return users.length;
}

async function getEntrepreneurLength() {
  const entrepreneurs = await sequelize.models.User.findAll({
    where: {
      isEntrepreneur: true,
    },
    attributes: ["id"],
  });
  return entrepreneurs.length;
}

async function getEnterpriseLength() {
  const enterprises = await sequelize.models.Enterprise.findAll({
    attributes: ["id"],
  });
  return enterprises.length;
}

async function getReservationLength() {
  const reservations = await sequelize.models.Reservation.findAll({
    attributes: ["id"],
  });
  return reservations.length;
}

async function getPremiumEnterpriseLength() {
  const now = new Date();
  const [manualPremium, subscriptions] = await Promise.all([
    sequelize.models.Enterprise.findAll({
      where: {
        premiumManualEnd: {
          [Op.gt]: now,
        },
      },
      attributes: ["id"],
      raw: true,
    }),
    sequelize.models.Subscription.findAll({
      where: { status: "active" },
      attributes: ["Enterprise_id"],
      raw: true,
    }),
  ]);

  const premiumIds = new Set();
  manualPremium.forEach((enterprise) => premiumIds.add(enterprise.id));
  subscriptions.forEach((subscription) => {
    if (subscription.Enterprise_id) {
      premiumIds.add(subscription.Enterprise_id);
    }
  });

  return premiumIds.size;
}

module.exports = {
  getUserLength,
  getEntrepreneurLength,
  getEnterpriseLength,
  getReservationLength,
  getPremiumEnterpriseLength,
};
