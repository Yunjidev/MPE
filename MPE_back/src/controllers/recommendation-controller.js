const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");

exports.getEnterpriseRecommendations = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    const recommendations = await sequelize.models.Recommendation.findAll({
      where: { Enterprise_id: enterprise.id },
      include: [{
        model: sequelize.models.User,
        as: "user",
        attributes: ["id", "username", "avatar"],
      }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ errors: error.message });
  }
};

exports.createRecommendation = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ errors: "Utilisateur non connecté" });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ errors: "La recommandation doit faire au moins 10 caractères." });
    }
    if (content.trim().length > 1000) {
      return res.status(400).json({ errors: "La recommandation ne peut pas dépasser 1000 caractères." });
    }

    const isNumeric = /^\d+$/.test(slug);
    const enterprise = isNumeric
      ? await sequelize.models.Enterprise.findByPk(parseInt(slug))
      : await sequelize.models.Enterprise.findOne({ where: { slug } });

    if (!enterprise) {
      return res.status(404).json({ errors: "Entreprise introuvable." });
    }

    const existing = await sequelize.models.Recommendation.findOne({
      where: { Enterprise_id: enterprise.id, User_id: req.user.id },
    });
    if (existing) {
      return res.status(400).json({ errors: "Vous avez déjà recommandé cette entreprise." });
    }

    const recommendation = await sequelize.models.Recommendation.create({
      content: content.trim(),
      Enterprise_id: enterprise.id,
      User_id: req.user.id,
    });

    const withUser = await sequelize.models.Recommendation.findByPk(recommendation.id, {
      include: [{
        model: sequelize.models.User,
        as: "user",
        attributes: ["id", "username", "avatar"],
      }],
    });

    res.status(201).json(withUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: error.message });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await sequelize.models.Recommendation.findByPk(id);

    if (!recommendation) {
      return res.status(404).json({ errors: "Recommandation introuvable." });
    }

    await recommendation.destroy();
    res.status(200).json({ message: "Recommandation supprimée." });
  } catch (error) {
    res.status(500).json({ errors: error.message });
  }
};
