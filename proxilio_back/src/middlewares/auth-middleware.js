const jwt = require("jsonwebtoken");
const { sequelize } = require("../../models/index");
const User = sequelize.models.User;

const isAuthenticated = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Utilisateur non connecté" });
  }
  token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.User_id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token Invalide" });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Action non autorisée" });
  }
  next();
};

const isOwner = (model) => async (req, res, next) => {
  const { id } = req.params;
  try {
    if (model === "User") {
      return next();
    }
    const resource = await sequelize.models[model].findByPk(id);
    if (!resource) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }
    const resourceOwnerId = resource.User_id ?? resource.user_id ?? resource.userId;
    if (resourceOwnerId !== req.user.id && req.user.isAdmin !== true) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }
    req.resource = resource;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const isEnterpriseOwner = () => async (req, res, next) => {
  const identifier = req.params.slug || req.params.id;
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non connecté" });
  }

  try {
    const isNumeric = /^\d+$/.test(identifier);
    const enterprise = isNumeric
      ? await sequelize.models.Enterprise.findByPk(parseInt(identifier))
      : await sequelize.models.Enterprise.findOne({ where: { slug: identifier } });
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    if (enterprise.User_id !== req.user.id && req.user.isAdmin !== true) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }
    req.enterprise = enterprise;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const isAuthorizedReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;

    if (reservationId) {
      const reservation = await sequelize.models.Reservation.findByPk(
        reservationId,
        {
          include: [
            {
              model: sequelize.models.Offer,
              as: "offer",
              include: [
                {
                  model: sequelize.models.Enterprise,
                  as: "enterprise",
                },
              ],
            },
          ],
        },
      );
      if (!reservation) {
        return res.status(404).json({ message: "Reservation non trouvée" });
      }
      if (
        reservation.User_id === req.user.id ||
        reservation.offer.enterprise.User_id === req.user.id ||
        req.user.isAdmin === true
      ) {
        return next();
      } else {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à effectuer cette action",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* Middleware optionnel : attache req.user si token valide, ne bloque pas sinon */
const softAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.User_id);
  } catch { /* token invalide ou expiré — on continue sans user */ }
  next();
};

module.exports = {
  isAuthenticated,
  isOwner,
  isEnterpriseOwner,
  isAdmin,
  isAuthorizedReservation,
  softAuth,
};
