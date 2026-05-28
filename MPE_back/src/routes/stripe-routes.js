const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const stripeController = require("../controllers/stripe-controller");

// Webhook doit être monté séparément dans app.js avec express.raw() (avant express.json())

router.use(authMiddleware.isAuthenticated);
router.post("/create-checkout-session", stripeController.createCheckoutSession);
router.get("/verify-session/:sessionId", stripeController.verifySession);
router.get("/my-subscription/:enterpriseId", stripeController.getMySubscription);
router.post("/cancel-subscription", stripeController.cancelSubscription);

module.exports = router;
