const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth-middleware");
const reservationController = require("../../controllers/reservation-controller");

// Appliquer l'authentification
router.use(authMiddleware.isAuthenticated);
// Routes pour les utilisateurs
router.use("/", require("./user"));
router.post(
  "/enterprises/:id/reservations",
  reservationController.createEnterpriseReservationByUser,
);
router.use(
  "/enterprises/:id",
  authMiddleware.isEnterpriseOwner(),
  require("./premium-calendar"),
);
// Routes verification propriétaire de l'entreprise
router.use(
  "/enterprise/:id",
  authMiddleware.isEnterpriseOwner(),
  require("./owner"),
);

module.exports = router;
