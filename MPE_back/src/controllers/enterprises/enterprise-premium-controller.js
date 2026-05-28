const { sequelize } = require("../../../models/index");
const Enterprise = sequelize.models.Enterprise;
const Subscription = sequelize.models.Subscription;
const { Job, User, Country } = require("../../../models/index");
const files = require("../../utils/files");
const { calculateAverageRatingForEnterprise } = require("../../utils/ratings");
const {
  sanitizeDuration,
  addDurationToDate,
  normalizeEnterprisePremiumState,
} = require("../../utils/premium");

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lowered = value.toLowerCase().trim();
    if (["true", "1", "yes", "on"].includes(lowered)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(lowered)) {
      return false;
    }
  }
  return null;
};

exports.getAllEnterprisesPremium = async (req, res) => {
  try {
    const enterprises = await Enterprise.findAll({
      where: { isValidate: true },
      attributes: [
        "id",
        "name",
        "logo",
        "city",
        "zip_code",
        "isPremium",
        "premiumManualStart",
        "premiumManualEnd",
      ],
      include: [
        {
          model: Subscription,
          as: "subscriptions",
          attributes: ["id", "status"],
          where: { status: "active" },
          required: false,
        },
        {
          model: User,
          as: "entrepreneur",
          attributes: ["id", "avatar", "username"],
        },
        {
          model: Job,
          as: "job",
          attributes: { exclude: ["createdAt", "updatedAt", "id"] },
        },
        {
          model: Country,
          as: "country",
          attributes: { exclude: ["createdAt", "updatedAt", "id"] },
        },
      ],
    });

    const premiumEnterprises = [];

    for (const enterpriseInstance of enterprises) {
      const hasActiveSubscription =
        Array.isArray(enterpriseInstance.subscriptions) &&
        enterpriseInstance.subscriptions.length > 0;

      const { shouldBePremium } = await normalizeEnterprisePremiumState(
        enterpriseInstance,
        hasActiveSubscription,
      );

      if (!shouldBePremium) {
        continue;
      }

      const enterprise = enterpriseInstance.toJSON();

      if (enterprise.logo) {
        enterprise.logo = files.getUrl(req, "enterprises/logo", enterprise.logo);
      }
      if (enterprise.job && enterprise.job.picture) {
        enterprise.job.picture = files.getUrl(
          req,
          "jobs/picture",
          enterprise.job.picture,
        );
      }
      if (enterprise.entrepreneur && enterprise.entrepreneur.avatar) {
        enterprise.entrepreneur.avatar = files.getUrl(
          req,
          "users/avatar",
          enterprise.entrepreneur.avatar,
        );
      }

      const averageRating = await calculateAverageRatingForEnterprise(
        enterprise.id,
      );

      enterprise.averageRating = averageRating;
      enterprise.isPremium = true;
      enterprise.hasActiveSubscription = hasActiveSubscription;
      delete enterprise.subscriptions;

      premiumEnterprises.push(enterprise);
    }

    res.status(200).json(premiumEnterprises);
  } catch (error) {
    console.error("Error fetching premium enterprises:", error);
    res.status(500).json({ errors: error.message });
  }
};

exports.updateEnterprisePremiumStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPremium, duration } = req.body;

    const parsedValue = parseBoolean(isPremium);

    if (parsedValue === null) {
      return res.status(400).json({
        message:
          "Le champ isPremium est requis et doit être de type booléen.",
      });
    }

    const enterprise = await Enterprise.findByPk(id, {
      include: [
        {
          model: Job,
          as: "job",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Country,
          as: "country",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });

    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    if (parsedValue) {
      const sanitizedDuration = sanitizeDuration(duration);
      if (!sanitizedDuration) {
        return res.status(400).json({
          message:
            "Veuillez fournir une durée valide (\"month\" ou \"year\") pour activer le premium.",
        });
      }

      const startDate = new Date();
      const endDate = addDurationToDate(startDate, sanitizedDuration);

      enterprise.premiumManualStart = startDate;
      enterprise.premiumManualEnd = endDate;
      enterprise.isPremium = true;
      await enterprise.save();

      return res.status(200).json({
        message: "Statut premium activé",
        enterprise: {
          id: enterprise.id,
          name: enterprise.name,
          isPremium: enterprise.isPremium,
          premiumManualStart: enterprise.premiumManualStart,
          premiumManualEnd: enterprise.premiumManualEnd,
        },
      });
    }

    enterprise.premiumManualStart = null;
    enterprise.premiumManualEnd = null;
    const activeSubscriptions = await enterprise.countSubscriptions({
      where: { status: "active" },
    });
    enterprise.isPremium = activeSubscriptions > 0;
    await enterprise.save();

    return res.status(200).json({
      message: "Statut premium désactivé",
      enterprise: {
        id: enterprise.id,
        name: enterprise.name,
        isPremium: enterprise.isPremium,
        premiumManualStart: enterprise.premiumManualStart,
        premiumManualEnd: enterprise.premiumManualEnd,
      },
    });
  } catch (error) {
    console.error("Error updating premium status:", error);
    res.status(500).json({ errors: error.message });
  }
};
