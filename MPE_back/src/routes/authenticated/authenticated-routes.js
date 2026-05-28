const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth-middleware");
const reservationController = require("../../controllers/reservation-controller");

// Appliquer l'authentification
router.use(authMiddleware.isAuthenticated);
// Routes pour les utilisateurs
router.use("/", require("./user"));
router.post(
  "/enterprises/:slug/reservations",
  reservationController.createEnterpriseReservationByUser,
);
router.use(
  "/enterprises/:slug",
  authMiddleware.isEnterpriseOwner(),
  require("./premium-calendar"),
);
// Routes verification propriétaire de l'entreprise
router.use(
  "/enterprise/:slug",
  authMiddleware.isEnterpriseOwner(),
  require("./owner"),
);

module.exports = router;
