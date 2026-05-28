const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const Reservation = sequelize.models.Reservation;
const Offer = sequelize.models.Offer;
const Enterprise = sequelize.models.Enterprise;
const {
  calculateEndTime,
  getAvailabilityDates,
} = require("../utils/availability");
const moment = require("moment-timezone");
const sendEmail = require("../mailers/email-service");

const CLIENT_URL = process.env.CLIENT_URL?.split(",")[0]?.trim() || "https://www.proxilio.fr";

function formatDateFr(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const FRENCH_DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const normalizeDateInput = (value) => {
  const parsed = moment(value);
  if (!parsed.isValid()) {
    return null;
  }
  return parsed.format("YYYY-MM-DD");
};

const ensurePremiumEnterprise = (enterprise) => {
  if (!enterprise || !enterprise.isPremium) {
    const error = new Error(
      "Cette entreprise n'est pas premium. Accès refusé.",
    );
    error.statusCode = 403;
    throw error;
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservation = await Reservation.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "Enterprise_id", "User_id"],
      },
      include: [
        {
          model: sequelize.models.Offer,
          as: "offer",
          attributes: {
            exclude: ["createdAt", "updatedAt", "Enterprise_id", "id"],
          },
          include: {
            model: sequelize.models.Enterprise,
            as: "enterprise",
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "id",
                "User_id",
                "Job_id",
                "Country_id",
                "phone",
                "mail",
                "adress",
                "city",
                "zip_code",
                "isValidate",
                "facebook",
                "instagram",
                "twitter",
                "siret_number",
                "description",
                "website",
                "photos",
              ],
            },
          },
        },
        {
          model: sequelize.models.User,
          as: "user",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "id",
              "isAdmin",
              "isEntrepreneur",
              "password",
              "resetPasswordToken",
              "resetPasswordExpires",
            ],
          },
        },
      ],
    });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      attributes: {
        exclude: ["createdAt", "updatedAt", "Enterprise_id", "id", "User_id"],
      },
      include: [
        {
          model: sequelize.models.Offer,
          as: "offer",
          attributes: {
            exclude: ["createdAt", "updatedAt", "Enterprise_id", "id"],
          },
          include: {
            model: sequelize.models.Enterprise,
            as: "enterprise",
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "id",
                "User_id",
                "Job_id",
                "Country_id",
                "phone",
                "mail",
                "adress",
                "city",
                "zip_code",
                "isValidate",
                "facebook",
                "instagram",
                "twitter",
                "siret_number",
                "description",
                "website",
                "photos",
              ],
            },
          },
        },
        {
          model: sequelize.models.User,
          as: "user",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "id",
              "isAdmin",
              "isEntrepreneur",
              "password",
              "resetPasswordToken",
              "resetPasswordExpires",
            ],
          },
        },
      ],
    });
    if (!reservation) {
      return res.status(404).json({ message: "Pas de reservation trouvée" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.getReservationsByEnterpriseId = async (req, res) => {
  try {
    const enterpriseId = req.enterprise.id;
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Offer,
          as: "offer",
          where: {
            Enterprise_id: enterpriseId,
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "Enterprise_id", "id"],
          },
          include: {
            model: Enterprise,
            as: "enterprise",
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "id",
                "User_id",
                "Job_id",
                "Country_id",
                "phone",
                "mail",
                "adress",
                "city",
                "zip_code",
                "isValidate",
                "facebook",
                "instagram",
                "twitter",
                "siret_number",
                "description",
                "website",
                "photos",
              ],
            },
          },
        },
        {
          model: sequelize.models.User,
          as: "user",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "id",
              "isAdmin",
              "isEntrepreneur",
              "password",
              "resetPasswordToken",
              "resetPasswordExpires",
            ],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "Enterprise_id", "User_id"],
      },
    });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const { date, start_time } = req.body;
    const offer = await sequelize.models.Offer.findByPk(id);
    const enterprise = await offer.getEnterprise();
    if (!offer) {
      return res.status(404).json({ errors: "Pas d'offre trouvée" });
    }
    if (!enterprise.isPremium) {
      return res
        .status(403)
        .json({ errors: "Cette entreprise n'est pas premium." });
    }
    if (!req.user) {
      return res.status(404).json({ errors: "Pas d'utilisateur trouvé" });
    }
    if (req.user.id === enterprise.User_id) {
      return res
        .status(400)
        .json({ errors: "Vous ne pouvez pas réserver votre propre offre" });
    }
    if (date < now) {
      return res
        .status(400)
        .json({ errors: "La date doit être dans le futur" });
    }

    const disponibilities = await enterprise.getDisponibilities();
    const indisponibilities = await enterprise.getIndisponibilities();
    const manualBlocks = await enterprise.getManualBlocks();
    const reservations = await Reservation.findAll({
      where: {
        Offer_id: {
          [Op.in]: (await enterprise.getOffers()).map((offer) => offer.id),
        },
      },
    });

    const isAvailable = !reservations.some((reservation) => {
      if (reservation.date === date) {
        const startTime = moment(start_time, "HH:mm");
        const endTime = calculateEndTime(startTime, offer.duration);
        const reservationStartTime = moment(reservation.start_time, "HH:mm");
        const reservationEndTime = moment(reservation.end_time, "HH:mm");
        if (
          (startTime >= reservationStartTime &&
            startTime < reservationEndTime) ||
          (endTime > reservationStartTime && endTime <= reservationEndTime) ||
          (startTime <= reservationStartTime && endTime >= reservationEndTime)
        ) {
          return true;
        }
      }
      return false;
    });

    if (!isAvailable) {
      return res
        .status(400)
        .json({ errors: "Le créneau horaire est déjà réservé" });
    }

    const manualBlockConflict = manualBlocks.some((block) => {
      const blockDate = moment(block.date).format("YYYY-MM-DD");
      if (blockDate !== moment(date).format("YYYY-MM-DD")) {
        return false;
      }
      const blockStart = moment(block.start_time, "HH:mm");
      const blockEnd = moment(block.end_time, "HH:mm");
      const startTime = moment(start_time, "HH:mm");
      const endTime = moment(calculateEndTime(start_time, offer.duration), "HH:mm");
      return startTime.isBefore(blockEnd) && endTime.isAfter(blockStart);
    });

    if (manualBlockConflict) {
      return res
        .status(400)
        .json({ errors: "Ce créneau est verrouillé." });
    }

    const newReservation = await Reservation.create({
      date,
      start_time,
      end_time: calculateEndTime(start_time, offer.duration),
      status: "pending",
      Offer_id: id,
      User_id: req.user.id,
      Enterprise_id: enterprise.id,
    });

    const formattedDate = formatDateFr(date);
    const enterpriseUrl = `${CLIENT_URL}/enterprise/${enterprise.slug || enterprise.id}`;

    // Email au client
    sendEmail(req.user.email, "Votre réservation est bien enregistrée — Proxilio", "reservation-confirmation-client", {
      clientName: req.user.username || req.user.firstname || "Client",
      enterpriseName: enterprise.name,
      offerName: offer.name,
      date: formattedDate,
      startTime: start_time,
      enterpriseUrl,
    });

    // Email au propriétaire de l'entreprise
    const owner = await sequelize.models.User.findByPk(enterprise.User_id, { attributes: ["email", "username", "firstname"] });
    if (owner) {
      sendEmail(owner.email, "Nouvelle réservation reçue — Proxilio", "reservation-new-owner", {
        ownerName: owner.username || owner.firstname || "Professionnel",
        clientName: req.user.username || req.user.firstname || "Client",
        offerName: offer.name,
        date: formattedDate,
        startTime: start_time,
        dashboardUrl: `${CLIENT_URL}/dashboard/enterprise/${enterprise.slug || enterprise.id}/reservations`,
      });
    }

    res.status(201).json({ message: "Réservation créée" });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, start_time, status } = req.body;
    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: sequelize.models.Offer,
          as: "offer",
          include: [
            {
              model: sequelize.models.Enterprise,
              as: "enterprise",
            },
          ],
        },
      ],
    });
    if (!reservation) {
      return res.status(404).json({ errors: "Pas de reservation trouvée" });
    }
    const isReservationOwner = reservation.User_id === req.user.id;
    const isReservationOfferOwner =
      reservation.offer.enterprise.User_id === req.user.id;

    if (!isReservationOwner && !isReservationOfferOwner && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ errors: "Vous n'êtes pas autorisé à effectuer cette action" });
    }
    if (isReservationOwner) {
      if (status && status === "cancelled") {
        reservation.status = "cancelled";
      } else if (date && reservation.status === "pending") {
        const enterprise = reservation.offer.enterprise;
        const disponibilities = await enterprise.getDisponibilities();
        const indisponibilities = await enterprise.getIndisponibilities();
        const manualBlocks = await enterprise.getManualBlocks();
        const reservations = await Reservation.findAll({
          where: {
            Offer_id: {
              [Op.in]: (await enterprise.getOffers()).map((offer) => offer.id),
            },
          },
        });

        const isAvailable = !reservations.some((otherReservation) => {
          if (otherReservation.date === date) {
            const startTime = moment(start_time, "HH:mm");
            const endTime = calculateEndTime(
              startTime,
              reservation.offer.duration,
            );
            const otherReservationStartTime = moment(
              otherReservation.start_time,
              "HH:mm",
            );
            const otherReservationEndTime = moment(
              otherReservation.end_time,
              "HH:mm",
            );
            if (
              (startTime >= otherReservationStartTime &&
                startTime < otherReservationEndTime) ||
              (endTime > otherReservationStartTime &&
                endTime <= otherReservationEndTime) ||
              (startTime <= otherReservationStartTime &&
                endTime >= otherReservationEndTime)
            ) {
              return true;
            }
          }
          return false;
        });

        if (!isAvailable) {
          return res
            .status(400)
            .json({ errors: "Le créneau horaire est déjà réservé" });
        }

        const manualBlockConflict = manualBlocks.some((block) => {
          const blockDate = moment(block.date).format("YYYY-MM-DD");
          if (blockDate !== moment(date).format("YYYY-MM-DD")) {
            return false;
          }
          const blockStart = moment(block.start_time, "HH:mm");
          const blockEnd = moment(block.end_time, "HH:mm");
          const startTime = moment(start_time, "HH:mm");
          const endTime = calculateEndTime(start_time, reservation.offer.duration);
          const endMoment = moment(endTime, "HH:mm");
          return startTime.isBefore(blockEnd) && endMoment.isAfter(blockStart);
        });

        if (manualBlockConflict) {
          return res
            .status(400)
            .json({ errors: "Ce créneau est verrouillé." });
        }

        reservation.date = date;
        reservation.start_time = start_time;
        reservation.end_time = calculateEndTime(
          start_time,
          reservation.offer.duration,
        );
        reservation.status = reservation.status;
      } else if (status === "cancelled") {
        reservation.status = "cancelled";
      }
    } else if (isReservationOfferOwner || req.user.isAdmin) {
      if (status) {
        reservation.status = status;
      }
      if (date) {
        reservation.date = date;
      }
      if (start_time) {
        reservation.start_time = start_time;
        reservation.end_time = calculateEndTime(
          start_time,
          reservation.offer.duration,
        );
      }
    }
    const timezone = "Europe/Paris";
    if (isReservationOfferOwner) {
      const now = moment.tz(timezone);
      if (status === "accepted" || status === "rejected") {
        reservation.status = status;
      } else if (status === "cancelled") {
        reservation.status = "cancelled";
      } else if (status === "done" && reservation.status === "accepted") {
        const reservationDate = new Date(reservation.date);
        const formattedDate = reservationDate.toISOString().split("T")[0];
        const reservationEndDateTime = moment.tz(
          `${formattedDate} ${reservation.end_time}`,
          "YYYY-MM-DD HH:mm",
          timezone,
        );
        if (reservationEndDateTime < now) {
          reservation.status = "done";
        } else {
          return res.status(400).json({
            errors: "La date de fin de la réservation doit être dans le futur",
          });
        }
      } else {
        return res.status(400).json({
          errors: "Vous ne pouvez pas changer le statut de la reservation",
        });
      }
    }
    await reservation.save();

    // Notifier le client si accepté ou refusé par le propriétaire
    if (isReservationOfferOwner && (status === "accepted" || status === "rejected")) {
      const client = await sequelize.models.User.findByPk(reservation.User_id, { attributes: ["email", "username", "firstname"] });
      if (client) {
        const enterprise = reservation.offer.enterprise;
        const isAccepted = status === "accepted";
        sendEmail(
          client.email,
          isAccepted ? "Votre réservation a été confirmée — Proxilio" : "Votre réservation a été refusée — Proxilio",
          "reservation-status-update",
          {
            clientName: client.username || client.firstname || "Client",
            statusLabel: isAccepted ? "confirmée" : "refusée",
            headerColor: isAccepted ? "#132A24" : "#7f1d1d",
            statusMessage: isAccepted
              ? `Bonne nouvelle ! <strong style="font-weight:500;">${enterprise.name}</strong> a confirmé votre rendez-vous. Pensez à vous préparer avant l'heure prévue.`
              : `<strong style="font-weight:500;">${enterprise.name}</strong> n'est pas en mesure d'honorer ce créneau. Vous pouvez en choisir un autre directement sur la fiche.`,
            offerName: reservation.offer.name,
            date: formatDateFr(reservation.date),
            startTime: reservation.start_time,
            enterpriseName: enterprise.name,
            enterpriseUrl: `${CLIENT_URL}/enterprise/${enterprise.slug || enterprise.id}`,
          }
        );
      }
    }

    res.status(200).json({ message: "Réservation modifiée" });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: Offer,
          as: "offer",
          include: [
            {
              model: Enterprise,
              as: "enterprise",
            },
          ],
        },
      ],
    });
    if (!reservation) {
      return res.status(404).json({ errors: "Pas de reservation trouvée" });
    }

    const isReservationOwner = reservation.User_id === req.user.id;
    const isReservationOfferOwner =
      reservation.offer?.enterprise?.User_id === req.user.id;

    if (!isReservationOwner && !isReservationOfferOwner && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ errors: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

    await reservation.destroy();
    res.status(200).json({ message: "reservation supprimée" });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.getEnterpriseReservationsForOwner = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const reservations = await Reservation.findAll({
      where: {
        Enterprise_id: enterprise.id,
      },
      include: [
        {
          model: Offer,
          as: "offer",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: sequelize.models.User,
          as: "user",
          attributes: [
            "id",
            "username",
            "firstname",
            "lastname",
            "email",
            "avatar",
          ],
        },
      ],
      order: [
        ["date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    return res.status(200).json(reservations);
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la récupération des réservations.";
    res.status(status).json({ error: message });
  }
};

exports.getEnterpriseReservationsPublic = async (req, res) => {
  try {
    const identifier = req.params.slug || req.params.id;
    const isNumeric = /^\d+$/.test(identifier);
    const enterprise = await Enterprise.findOne({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
      attributes: ["id", "isPremium"],
    });

    if (!enterprise) {
      return res.status(404).json({ error: "Entreprise introuvable." });
    }

    ensurePremiumEnterprise(enterprise);

    const reservations = await Reservation.findAll({
      where: {
        Enterprise_id: enterprise.id,
        status: {
          [Op.notIn]: ["cancelled", "rejected"],
        },
      },
      attributes: [
        "id",
        "date",
        "start_time",
        "end_time",
        "status",
        "Offer_id",
        "contact_phone",
      ],
      include: [
        {
          model: Offer,
          as: "offer",
          attributes: ["id", "name", "duration", "price"],
        },
      ],
      order: [
        ["date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    return res.status(200).json(reservations);
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la récupération des réservations.";
    res.status(status).json({ error: message });
  }
};

exports.createEnterpriseReservationByUser = async (req, res) => {
  try {
    const identifier = req.params.slug || req.params.id;
    const { date, start_time, offerId, phone } = req.body;

    if (!date || !start_time || !offerId || !phone) {
      return res.status(400).json({
        error:
          "La date, l'heure de début, la prestation et le numéro de téléphone sont obligatoires.",
      });
    }

    const normalizedDate = normalizeDateInput(date);
    if (!normalizedDate) {
      return res
        .status(400)
        .json({ error: "La date fournie est invalide." });
    }

    const isNumeric = /^\d+$/.test(identifier);
    const enterprise = await Enterprise.findOne({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
      include: [
        {
          model: Offer,
          as: "offers",
          attributes: ["id", "name", "duration", "price", "image"],
        },
        {
          model: sequelize.models.Disponibility,
          as: "disponibilities",
          attributes: ["id", "day", "start_hour", "end_hour"],
        },
        {
          model: sequelize.models.Indisponibility,
          as: "indisponibilities",
          attributes: [
            "id",
            "start_date",
            "end_date",
            "start_hour",
            "end_hour",
          ],
        },
        {
          model: sequelize.models.ManualBlock,
          as: "manualBlocks",
          attributes: ["id", "date", "start_time", "end_time"],
        },
      ],
    });

    if (!enterprise || !enterprise.isValidate) {
      return res.status(404).json({ error: "Entreprise introuvable." });
    }

    ensurePremiumEnterprise(enterprise);

    const offer = enterprise.offers.find(
      (item) => Number(item.id) === Number(offerId),
    );

    if (!offer) {
      return res
        .status(404)
        .json({ error: "Prestation introuvable pour cette entreprise." });
    }

    const duration = parseInt(offer.duration, 10);
    if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        error: "La prestation sélectionnée ne possède pas de durée valide.",
      });
    }

    const sanitizedPhone = String(phone).replace(/[\s.-]/g, "").trim();
    if (!/^\+?[0-9]{6,15}$/.test(sanitizedPhone)) {
      return res
        .status(400)
        .json({ error: "Numéro de téléphone invalide." });
    }

    const requestedDate = moment(normalizedDate, "YYYY-MM-DD");
    const now = moment().startOf("day");
    if (requestedDate.isBefore(now)) {
      return res
        .status(400)
        .json({ error: "La date doit être postérieure à aujourd'hui." });
    }

    const dayLabel = FRENCH_DAYS[requestedDate.day()];
    const matchingDisponibilities = enterprise.disponibilities.filter(
      (disponibility) => disponibility.day === dayLabel,
    );

    if (matchingDisponibilities.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun créneau disponible pour ce jour." });
    }

    const startMoment = moment(start_time, "HH:mm");
    if (!startMoment.isValid()) {
      return res
        .status(400)
        .json({ error: "L'heure de début est invalide." });
    }

    const endMoment = startMoment.clone().add(duration, "minutes");
    const end_time = endMoment.format("HH:mm");

    const fitsInAvailability = matchingDisponibilities.some((disponibility) => {
      const dispoStart = moment(disponibility.start_hour, "HH:mm");
      const dispoEnd = moment(disponibility.end_hour, "HH:mm");
      return (
        startMoment.isSameOrAfter(dispoStart) &&
        endMoment.isSameOrBefore(dispoEnd)
      );
    });

    if (!fitsInAvailability) {
      return res
        .status(400)
        .json({ error: "Ce créneau ne correspond à aucune disponibilité." });
    }

    const overlapsReservation = await Reservation.findOne({
      where: {
        Enterprise_id: enterprise.id,
        date: normalizedDate,
        status: {
          [Op.notIn]: ["cancelled", "rejected"],
        },
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [
                startMoment.format("HH:mm"),
                endMoment.format("HH:mm"),
              ],
            },
          },
          {
            end_time: {
              [Op.between]: [
                startMoment.format("HH:mm"),
                endMoment.format("HH:mm"),
              ],
            },
          },
          {
            [Op.and]: [
              {
                start_time: {
                  [Op.lte]: startMoment.format("HH:mm"),
                },
              },
              {
                end_time: {
                  [Op.gte]: endMoment.format("HH:mm"),
                },
              },
            ],
          },
        ],
      },
    });

    if (overlapsReservation) {
      return res.status(409).json({ error: "Ce créneau est déjà réservé." });
    }

    const overlapsManualBlock = enterprise.manualBlocks?.some((block) => {
      if (
        !moment(block.date, "YYYY-MM-DD").isSame(requestedDate, "day")
      ) {
        return false;
      }
      const blockStart = moment(block.start_time, "HH:mm");
      const blockEnd = moment(block.end_time, "HH:mm");
      return startMoment.isBefore(blockEnd) && endMoment.isAfter(blockStart);
    });

    if (overlapsManualBlock) {
      return res.status(400).json({ error: "Ce créneau est fermé." });
    }

    const isWithinIndisponibility = enterprise.indisponibilities.some(
      (indisponibility) => {
        const startDate = moment(indisponibility.start_date, "YYYY-MM-DD");
        const endDate = moment(indisponibility.end_date, "YYYY-MM-DD");
        if (!requestedDate.isBetween(startDate, endDate, undefined, "[]")) {
          return false;
        }
        const indispoStart = moment(indisponibility.start_hour, "HH:mm");
        const indispoEnd = moment(indisponibility.end_hour, "HH:mm");
        return (
          startMoment.isBefore(indispoEnd) && endMoment.isAfter(indispoStart)
        );
      },
    );

    if (isWithinIndisponibility) {
      return res.status(400).json({ error: "Ce créneau est indisponible." });
    }

    const newReservation = await Reservation.create({
      date: normalizedDate,
      start_time: startMoment.format("HH:mm"),
      end_time,
      status: "pending",
      Enterprise_id: enterprise.id,
      Offer_id: offer.id,
      User_id: req.user.id,
      contact_phone: sanitizedPhone,
    });

    return res.status(201).json({
      message: "Réservation enregistrée. Elle est en attente de confirmation.",
      reservation: newReservation,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la création de la réservation.";
    res.status(status).json({ error: message });
  }
};
