"use strict";

const express = require("express");
const router = express.Router();
const premiumCalendarController = require("../../controllers/enterprises/premium-calendar-controller");
const reservationController = require("../../controllers/reservation-controller");

router.get("/disponibilites", premiumCalendarController.listForOwner);
router.post("/disponibilites", premiumCalendarController.createForOwner);
router.delete(
  "/disponibilites/:disponibilityId",
  premiumCalendarController.deleteForOwner,
);

router.post("/manual-blocks", premiumCalendarController.createManualBlock);
router.delete(
  "/manual-blocks/:blockId",
  premiumCalendarController.deleteManualBlock,
);

router.get("/reservations", reservationController.getEnterpriseReservationsForOwner);
router.post("/reservations/manual", reservationController.createManualReservationForOwner);

module.exports = router;
