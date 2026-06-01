const express = require("express");
const router = express.Router();
// Middlewares
const files = require("../../utils/files");
const authMiddleware = require("../../middlewares/auth-middleware");
const { validate } = require("../../middlewares/validations-middleware");
// Validations
const { userValidationRules } = require("../../utils/uservalidationsrules");
const {
  enterpriseValidationRules,
} = require("../../utils/enterprisevalidationsrules");
const { ratingValidationRules } = require("../../utils/ratingvalidationsrules");
// Controllers
const userController = require("../../controllers/users/user-controller");
const authController = require("../../controllers/users/auth-controller");
const enterprisesController = require("../../controllers/enterprises/enterprises-controller");
const ratingController = require("../../controllers/rating-controller");
const reservationsController = require("../../controllers/reservation-controller");
const likeController = require("../../controllers/like-controller");

// Route User
router.get("/user/profile", userController.getUserProfile);
router.get("/user/enterprises", userController.getUserEnterprises);
router.put(
  "/user/update",
  files.upload("users").single("avatar"),
  authMiddleware.isOwner("User"),
  userValidationRules(true),
  validate,
  authController.updateUser,
);
router.post("/signout", authController.logout);
router.delete("/users/delete", authController.deleteUser);

// Routes Enterprise
const uploadFiles = files.upload("enterprises").fields([
  { name: "banner", maxCount: 1, folder: "photos" }, // photo de couverture
  { name: "photos", maxCount: 3, folder: "photos" }, // galerie (max 3)
  { name: "logo",   maxCount: 1, folder: "logo"   },
]);

router.post(
  "/enterprise",
  uploadFiles,
  enterpriseValidationRules(),
  validate,
  enterprisesController.createEnterprise,
);

// Routes Rating
router.post(
  "/offer/:id/rating",
  ratingValidationRules(),
  validate,
  ratingController.createRating,
);
router.delete(
  "/rating/:id",
  authMiddleware.isOwner("Rating"),
  ratingController.deleteRating,
);

// Routes Reservation
router.post("/offer/:id/reservation", reservationsController.createReservation);
router.put(
  "/reservation/:id",
  authMiddleware.isAuthorizedReservation,
  reservationsController.updateReservation,
);

// Routes Like
router.get("/likes", likeController.getLikes);
router.post("/enterprise/:id/like", likeController.createLike);
router.delete("/enterprise/:id/like", likeController.deleteLike);

// Messagerie user
const messageController = require("../../controllers/message-controller");
router.get("/user/messages/unread-count", messageController.getUserUnreadCount);
router.get("/user/messages", messageController.listUserMessages);
router.put("/user/messages/:messageId/seen", messageController.markUserSeen);
router.post("/user/messages/:messageId/reply", messageController.replyAsUser);
router.delete("/user/messages/:messageId", messageController.deleteMessageAsUser);

const notifController = require("../../controllers/notification-controller");
router.get("/user/notifications", notifController.listNotifications);
router.put("/user/notifications/read-all", notifController.markAllAsRead);
router.put("/user/notifications/:notifId/read", notifController.markAsRead);

// Parrainage
const referralController = require("../../controllers/referral-controller");
router.get("/user/referral",       referralController.getStats);
router.post("/user/referral/claim", referralController.claimReferral);

module.exports = router;