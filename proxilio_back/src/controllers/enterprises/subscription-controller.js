const { sequelize } = require("../../../models/index");
const Subscription = sequelize.models.Subscription;
const Enterprise = sequelize.models.Enterprise;
const { User } = require("../../../models/index");
const { normalizeEnterprisePremiumState } = require("../../utils/premium");
const sendEmail = require("../../mailers/email-service");

const syncEnterprisePremiumStatus = async (enterpriseId) => {
  if (!enterpriseId) {
    return null;
  }

  const [enterprise, activeCount] = await Promise.all([
    Enterprise.findByPk(enterpriseId),
    Subscription.count({
      where: { Enterprise_id: enterpriseId, status: "active" },
    }),
  ]);

  if (!enterprise) {
    return null;
  }

  const { shouldBePremium } = await normalizeEnterprisePremiumState(
    enterprise,
    activeCount > 0,
  );

  return shouldBePremium;
};

exports.createSubscriptionAdmin = async (req, res) => {
  try {
    const { subscription_type, status, Enterprise_id } = req.body;

    if (!Enterprise_id) return res.status(400).json({ errors: "Enterprise_id requis" });

    const enterprise = await Enterprise.findByPk(Enterprise_id);
    if (!enterprise) return res.status(404).json({ errors: "Entreprise non trouvée" });

    const start_date = new Date();
    let end_date;
    switch (subscription_type) {
      case "monthly":
        end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + 1);
        break;
      case "yearly":
        end_date = new Date(start_date);
        end_date.setFullYear(end_date.getFullYear() + 1);
        break;
      case "forever":
        end_date = new Date(start_date);
        end_date.setFullYear(9999);
        break;
      default:
        return res.status(400).json({ errors: "Type de subscription invalide" });
    }

    const newSubscription = await Subscription.create({
      subscription_type,
      status: status || "active",
      start_date,
      end_date,
      Enterprise_id,
    });

    if ((status || "active") === "active") {
      enterprise.isPremium = true;
      await enterprise.save();
    }

    const isPremium = await syncEnterprisePremiumStatus(Enterprise_id);
    res.status(201).json({
      message: "Subscription créée",
      subscription: newSubscription.toJSON(),
      isPremium,
    });

    if ((status || "active") === "active") {
      const owner = await User.findByPk(enterprise.User_id);
      if (owner) {
        const planLabels = { monthly: "Mensuel — 30 €/mois", yearly: "Annuel — 300 €/an", forever: "À vie" };
        sendEmail(
          owner.email,
          "Votre abonnement Premium est actif — Proxilio",
          "subscription-confirmed",
          {
            user: owner.username || owner.firstname || owner.email,
            enterprise: enterprise.name,
            plan_label: planLabels[subscription_type] || subscription_type,
            url: `${process.env.CLIENT_URL}/dashboard/user-db`,
          }
        ).catch((err) => console.error("sendEmail subscription-confirmed:", err));
      }
    }
  } catch (error) {
    res.status(500).json({ errors: error.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscription = await Subscription.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "Enterprise_id"],
        include: ["id"],
      },
      include: {
        model: sequelize.models.Enterprise,
        as: "enterprise",
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "User_id",
            "Job_id",
            "Country_id",
            "phone",
            "mail",
            "adress",
            "zip_code",
            "isValidate",
            "facebook",
            "instagram",
            "twitter",
            "siret_number",
            "description",
            "website",
            "photos",
          ],
        },
      },
    });
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id, {
      attributes: {
        exclude: ["createdAt", "updatedAt", "Enterprise_id"],
      },
      include: {
        model: sequelize.models.Enterprise,
        as: "enterprise",
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "User_id",
            "Job_id",
            "Country_id",
            "phone",
            "mail",
            "adress",
            "city",
            "zip_code",
            "isValidate",
            "facebook",
            "instagram",
            "twitter",
            "siret_number",
            "description",
            "website",
            "photos",
          ],
        },
      },
    });
    if (!subscription) {
      return res.status(404).json({ errors: "Pas de subscription trouvée" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { subscription_type, status } = req.body;
    const start_date = new Date();
    let end_date;
    switch (subscription_type) {
      case "monthly":
        end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + 1);
        break;
      case "yearly":
        end_date = new Date(start_date);
        end_date.setFullYear(end_date.getFullYear() + 1);
        break;
      case "forever":
        end_date = new Date(start_date);
        end_date.setFullYear(9999);
        break;
      default:
        return res
          .status(400)
          .json({ errors: "Type de subscription invalide" });
    }
    const newSubscription = await Subscription.create({
      subscription_type,
      status,
      start_date,
      end_date,
      Enterprise_id: req.enterprise.id,
    });
    const isPremium = await syncEnterprisePremiumStatus(req.enterprise.id);
    res.status(201).json({
      message: "Subscription créée",
      subscription: newSubscription.toJSON(),
      isPremium,
    });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, subscription_type } = req.body;
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ errors: "Pas de subscription trouvée" });
    }
    if (status) {
      subscription.status = status;
    }
    if (subscription_type) {
      subscription.subscription_type = subscription_type;
      // Recalcule end_date selon le nouveau type
      const start = new Date(subscription.start_date);
      if (subscription_type === "monthly") {
        const d = new Date(start);
        d.setMonth(d.getMonth() + 1);
        subscription.end_date = d;
      } else if (subscription_type === "yearly") {
        const d = new Date(start);
        d.setFullYear(d.getFullYear() + 1);
        subscription.end_date = d;
      } else if (subscription_type === "forever") {
        const d = new Date(start);
        d.setFullYear(9999);
        subscription.end_date = d;
      }
    }
    await subscription.save();
    const isPremium = await syncEnterprisePremiumStatus(
      subscription.Enterprise_id,
    );
    res.status(200).json({ message: "Subscription modifiée", isPremium });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Requête DELETE reçue pour l'ID : ${id}`);
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      console.log("Pas de subscription trouvée");
      return res.status(404).json({ errors: "Pas de subscription trouvée" });
    }
    await subscription.destroy();
    console.log("Subscription supprimée");
    const isPremium = await syncEnterprisePremiumStatus(
      subscription.Enterprise_id,
    );
    res.status(200).json({ message: "Subscription supprimée", isPremium });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la souscription ${id}:`, error);
    res.status(500).json({ errors: error.message });
  }
};
