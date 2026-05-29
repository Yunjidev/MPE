const express = require("express");
const router = express.Router();
// Middlewares
const files = require("../../utils/files");
const { validate } = require("../../middlewares/validations-middleware");
// validations
const {
  enterpriseValidationRules,
} = require("../../utils/enterprisevalidationsrules");
const { offerValidationRules } = require("../../utils/offervalidationsrules");
// Controllers
// users
const authController = require("../../controllers/users/auth-controller");
// enterprises
const enterprisesController = require("../../controllers/enterprises/enterprises-controller");
const disponibilitiesController = require("../../controllers/enterprises/disponibility-controller");
const inDisponibilitiesController = require("../../controllers/enterprises/indisponibility-controller");
const offersController = require("../../controllers/enterprises/offer-controller");
const subscriptionsController = require("../../controllers/enterprises/subscription-controller");
const reservationsController = require("../../controllers/reservation-controller");
const likeController = require("../../controllers/like-controller");
const quoteController   = require("../../controllers/quote-controller");
const invoiceController = require("../../controllers/invoice-controller");

// Route Enterprise
const uploadFiles = files.upload("enterprises").fields([
  { name: "photos", maxCount: 4, folder: "photos" },
  { name: "logo", maxCount: 1, folder: "logo" },
]);

router.put(
  "/",
  uploadFiles,
  enterpriseValidationRules(true),
  validate,
  enterprisesController.updateEnterprise,
);
router.delete("/", enterprisesController.deleteEnterprise);

// Informations de paiement de l'entreprise
router.get("/payment-info", enterprisesController.getPaymentInfo);
router.put("/payment-info", enterprisesController.updatePaymentInfo);

// Routes Disponibilité
router.post("/disponibility", disponibilitiesController.createDisponibility);
router.use("/disponibility/:id", disponibilitiesController.updateDisponibility);
router.delete(
  "/disponibility/:id",
  disponibilitiesController.deleteDisponibility,
);

// Routes Indisponibilité
router.post(
  "/indisponibility",
  inDisponibilitiesController.createInDisponibility,
);
router.use(
  "/indisponibility/:id",
  inDisponibilitiesController.updateInDisponibility,
);
router.delete(
  "/indisponibility/:id",
  inDisponibilitiesController.deleteInDisponibility,
);

// Routes Offre
router.get("/offers", offersController.getOfferByEnterpriseId);
router.post(
  "/offer",
  files.upload("offers").single("image"),
  offerValidationRules(),
  validate,
  offersController.createOffer,
);
router.put(
  "/offer/:id",
  files.upload("offers").single("image"),
  offerValidationRules(true),
  validate,
  offersController.updateOffer,
);
router.delete("/offer/:id", offersController.deleteOffer);

// Routes Subscription
router.post("/subscription", subscriptionsController.createSubscription);
router.use("/subscription/:id", subscriptionsController.updateSubscription);
router.delete("/subscription/:id", subscriptionsController.deleteSubscription);

// Routes Reservation
router.get(
  "/reservations",
  reservationsController.getReservationsByEnterpriseId,
);

// Routes Devis
router.get("/quotes", quoteController.listQuotes);
router.post("/quotes", quoteController.createQuote);
router.get("/quotes/:quoteId", quoteController.getQuote);
router.put("/quotes/:quoteId", quoteController.updateQuote);
router.delete("/quotes/:quoteId", quoteController.deleteQuote);
router.post("/quotes/:quoteId/send", quoteController.sendQuoteByEmail);

// Routes Factures
router.get("/invoices", invoiceController.listInvoices);
router.post("/invoices", invoiceController.createInvoice);
router.get("/invoices/:invoiceId", invoiceController.getInvoice);
router.put("/invoices/:invoiceId", invoiceController.updateInvoice);
router.delete("/invoices/:invoiceId", invoiceController.deleteInvoice);
router.post("/invoices/:invoiceId/send", invoiceController.sendInvoiceByEmail);
router.post("/quotes/:quoteId/to-invoice", invoiceController.createFromQuote);

// Routes Like
router.get("/enterprises/:id/likes", likeController.getLikeByEnterpriseId);

// Messagerie
const messageController = require("../../controllers/message-controller");
router.get("/messages", messageController.listMessages);
router.put("/messages/:messageId/read", messageController.markAsRead);
router.delete("/messages/:messageId", messageController.deleteMessage);

module.exports = router;