"use strict";

const { Op } = require("sequelize");
const { sequelize } = require("../../../models/index");
const Disponibility = sequelize.models.Disponibility;
const ManualBlock = sequelize.models.ManualBlock;
const Enterprise = sequelize.models.Enterprise;

const normalizeDays = (values) => {
  if (!values) {
    return [];
  }
  if (Array.isArray(values)) {
    return values.filter(Boolean);
  }
  return [values].filter(Boolean);
};

const ensurePremium = (enterprise) => {
  if (!enterprise || !enterprise.isPremium) {
    const error = new Error(
      "Cette entreprise n'est pas premium. Accès refusé.",
    );
    error.statusCode = 403;
    throw error;
  }
};

exports.listPublic = async (req, res) => {
  try {
    const identifier = req.params.id || req.params.slug;
    const isNumeric = /^\d+$/.test(identifier);
    const whereClause = isNumeric ? { id: parseInt(identifier) } : { slug: identifier };
    const enterprise = await Enterprise.findOne({ where: whereClause,
      attributes: ["id", "isPremium"],
      include: [
        {
          model: sequelize.models.Disponibility,
          as: "disponibilities",
          attributes: ["id", "day", "start_hour", "end_hour"],
        },
        {
          model: sequelize.models.ManualBlock,
          as: "manualBlocks",
          attributes: ["id", "date", "start_time", "end_time", "reason"],
          where: {
            date: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          required: false,
        },
      ],
      order: [
        [
          { model: sequelize.models.Disponibility, as: "disponibilities" },
          "day",
          "ASC",
        ],
        [
          { model: sequelize.models.ManualBlock, as: "manualBlocks" },
          "date",
          "ASC",
        ],
      ],
    });

    if (!enterprise) {
      return res.status(404).json({ error: "Entreprise introuvable." });
    }

    ensurePremium(enterprise);

    return res.status(200).json({
      disponibilities: enterprise.disponibilities || [],
      manualBlocks: enterprise.manualBlocks || [],
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la récupération des disponibilités.";
    res.status(status).json({ error: message });
  }
};

exports.listForOwner = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);

    const [disponibilities, manualBlocks] = await Promise.all([
      enterprise.getDisponibilities({
        attributes: ["id", "day", "start_hour", "end_hour"],
        order: [
          ["day", "ASC"],
          ["start_hour", "ASC"],
        ],
      }),
      enterprise.getManualBlocks({
        attributes: ["id", "date", "start_time", "end_time", "reason"],
        order: [
          ["date", "ASC"],
          ["start_time", "ASC"],
        ],
      }),
    ]);

    return res.status(200).json({ disponibilities, manualBlocks });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la récupération des disponibilités.";
    res.status(status).json({ error: message });
  }
};

exports.createForOwner = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);

    const { day, start_hour, end_hour } = req.body;
    const days = normalizeDays(day);

    if (days.length === 0) {
      return res.status(400).json({ error: "Veuillez sélectionner au moins un jour." });
    }

    if (!start_hour || !end_hour) {
      return res
        .status(400)
        .json({ error: "Les heures de début et de fin sont obligatoires." });
    }

    if (start_hour >= end_hour) {
      return res
        .status(400)
        .json({ error: "L'heure de fin doit être supérieure à l'heure de début." });
    }

    const overlapping = await Promise.all(
      days.map((singleDay) =>
        Disponibility.isOverlapping(
          singleDay,
          start_hour,
          end_hour,
          enterprise.id,
        ),
      ),
    );

    if (overlapping.some(Boolean)) {
      return res
        .status(409)
        .json({ error: "Un créneau se chevauche déjà avec ces horaires." });
    }

    const creations = await Promise.all(
      days.map((singleDay) =>
        Disponibility.create({
          day: singleDay,
          start_hour,
          end_hour,
          Enterprise_id: enterprise.id,
        }),
      ),
    );

    return res.status(201).json({
      message: "Créneaux créés avec succès.",
      disponibilities: creations,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la création des disponibilités.";
    res.status(status).json({ error: message });
  }
};

exports.deleteForOwner = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);

    const { disponibilityId } = req.params;
    const disponibility = await Disponibility.findByPk(disponibilityId);

    if (!disponibility || disponibility.Enterprise_id !== enterprise.id) {
      return res.status(404).json({ error: "Créneau introuvable." });
    }

    await disponibility.destroy();
    return res.status(200).json({ message: "Créneau supprimé avec succès." });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la suppression du créneau.";
    res.status(status).json({ error: message });
  }
};

exports.createManualBlock = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);

    const { date, start_time, end_time, reason } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        error: "La date ainsi que les heures de début et de fin sont obligatoires.",
      });
    }

    if (start_time >= end_time) {
      return res
        .status(400)
        .json({ error: "L'heure de fin doit être supérieure à l'heure de début." });
    }

    const overlap = await ManualBlock.findOne({
      where: {
        Enterprise_id: enterprise.id,
        date,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [start_time, end_time],
            },
          },
          {
            end_time: {
              [Op.between]: [start_time, end_time],
            },
          },
          {
            [Op.and]: [
              {
                start_time: {
                  [Op.lte]: start_time,
                },
              },
              {
                end_time: {
                  [Op.gte]: end_time,
                },
              },
            ],
          },
        ],
      },
    });

    if (overlap) {
      return res
        .status(409)
        .json({ error: "Un verrou existe déjà sur cette plage horaire." });
    }

    const block = await ManualBlock.create({
      date,
      start_time,
      end_time,
      reason: reason ? reason.trim() : null,
      Enterprise_id: enterprise.id,
    });

    return res.status(201).json({ message: "Créneau verrouillé", block });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de l'ajout de la fermeture.";
    res.status(status).json({ error: message });
  }
};

exports.deleteManualBlock = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);

    const { blockId } = req.params;
    const block = await ManualBlock.findByPk(blockId);

    if (!block || block.Enterprise_id !== enterprise.id) {
      return res.status(404).json({ error: "Blocage introuvable." });
    }

    await block.destroy();
    return res.status(200).json({ message: "Blocage supprimé" });
  } catch (error) {
    const status = error.statusCode || 500;
    const message =
      error.statusCode === 403
        ? error.message
        : "Erreur lors de la suppression de la fermeture.";
    res.status(status).json({ error: message });
  }
};
