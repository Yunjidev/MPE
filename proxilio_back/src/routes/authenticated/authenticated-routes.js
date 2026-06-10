const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth-middleware");
const reservationController = require("../../controllers/reservation-controller");

// Appliquer l'authentification
router.use(authMiddleware.isAuthenticated);
// Routes pour les utilisateurs
router.use("/", require("./user"));

// Revendication de fiches publiques (pas besoin d'être propriétaire)
const claimController = require("../../controllers/claim-controller");
router.post("/enterprise/:slug/initiate-claim", claimController.initiateClaim);
router.post("/enterprise/:slug/verify-claim",   claimController.verifyClaim);
router.post("/enterprise/:slug/resend-claim",   claimController.resendClaim);
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
