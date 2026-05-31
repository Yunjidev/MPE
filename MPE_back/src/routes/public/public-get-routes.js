const express = require("express");
const router = express.Router();
// Controllers
// enterprises
const enterpriseController = require("../../controllers/enterprises/enterprises-controller");
const enterpriseValidateController = require("../../controllers/enterprises/enterprises-validate-controller");
const enterprisePremiumController = require("../../controllers/enterprises/enterprise-premium-controller");
const nearbyController = require("../../controllers/enterprises/nearby-controller");
const enterprisePremiumCalendarController = require("../../controllers/enterprises/premium-calendar-controller");
const reservationController = require("../../controllers/reservation-controller");
// static
const conditionController = require("../../controllers/static/conditions-controller");
const faqController = require("../../controllers/static/faq-controller");
const pricingController = require("../../controllers/static/pricings-controller");
const teamController = require("../../controllers/static/team-controller");
const countryController = require("../../controllers/static/country-controller");
const jobsController = require("../../controllers/static/job-controller");
const searchController = require("../../controllers/static/search-controller");
const statsController = require("../../controllers/stats-controller");
const sitemapController = require("../../controllers/sitemap-controller");
const settingsController = require("../../controllers/settings-controller");

// Public settings
router.get("/settings/banner", settingsController.getBanner);

// Enterprise routes
router.get("/enterprises/nearby", nearbyController.getNearbyEnterprises);
router.get(
  "/enterprises/validate",
  enterpriseValidateController.getAllEnterprisesValidate,
);
router.get(
  "/enterprises/premium",
  enterprisePremiumController.getAllEnterprisesPremium,
);
router.get(
  "/enterprise/:slug",
  enterpriseValidateController.getEnterpriseByIdValidate,
);
router.get(
  "/enterprises/:id/disponibilites",
  enterprisePremiumCalendarController.listPublic,
);
router.get(
  "/enterprises/:id/reservations/public",
  reservationController.getEnterpriseReservationsPublic,
);

// Pricing routes
router.get("/pricings", pricingController.getAllPricings);
router.get("/pricing/:id", pricingController.getPricingById);

// condition routes
router.get("/conditions", conditionController.getAllConditions);
router.get("/condition/:id", conditionController.getConditionById);

// faq routes
router.get("/faqs", faqController.getAllFaqs);
router.get("/faq/:id", faqController.getFaqById);

// team routes
router.get("/teams", teamController.getAllTeams);
router.get("/team/:id", teamController.getTeamById);

// Routes Country
router.get("/countries", countryController.getAllCountries);

// Routes Job
router.get("/jobs", jobsController.getAllJobs);

// Routes pages métier programmatiques
const byJobController = require("../../controllers/enterprises/by-job-controller");
router.get("/jobs-with-count",          byJobController.getJobsWithCount);
router.get("/enterprises/by-job/:jobSlug", byJobController.getByJob);

// Routes Search
router.get("/search", searchController.search);

// Routes Stats
router.get("/stats", statsController.getAllStats);

// Sitemap
router.get("/sitemap", sitemapController.getSitemap);

module.exports = router;
