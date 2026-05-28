const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../../controllers/users/auth-controller");
const files = require("../../utils/files");
const { validate } = require("../../middlewares/validations-middleware");
const { userValidationRules } = require("../../utils/uservalidationsrules");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: "Trop de tentatives, réessayez dans 15 minutes." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: "Trop de demandes de réinitialisation, réessayez dans 1 heure." },
});

router.post(
  "/signup",
  authLimiter,
  files.upload("users").single("avatar"),
  userValidationRules(true),
  validate,
  authController.signup,
);

router.post("/signin", authLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/validate-refresh-token", authController.validateRefreshToken);

router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password/:token", forgotPasswordLimiter, authController.resetPassword);

const { sendContact, contactLimiter, contactValidation } = require("../../controllers/contact-controller");
router.post("/contact", contactLimiter, contactValidation, sendContact);

module.exports = router;