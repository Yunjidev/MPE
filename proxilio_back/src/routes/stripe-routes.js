const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const stripeController = require("../controllers/stripe-controller");

// Webhook doit être monté séparément dans app.js avec express.raw() (avant express.json())

// verify-session est publique : la session_id Stripe est elle-même la preuve de paiement
// (le JWT peut expirer pendant le checkout Stripe, surtout avec un access token de 15min)
router.get("/verify-session/:sessionId", stripeController.verifySession);

router.use(authMiddleware.isAuthenticated);
router.post("/create-checkout-session", stripeController.createCheckoutSession);
router.get("/my-subscription/:enterpriseId", stripeController.getMySubscription);
router.post("/cancel-subscription", stripeController.cancelSubscription);

module.exports = router;
