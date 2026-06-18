const { body } = require("express-validator");
const { sequelize } = require("../../models/index");
const Enterprise = sequelize.models.Enterprise;

const offerValidationRules = (isUpdate = false) => {
  const rules = [];
  if (!isUpdate) {
    rules.push(
      body("name")
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage(
          "Le nom du service doit faire entre 3 et 50 caractères",
        ),
      body("description").bail().trim(),
      body("price")
        .trim()
        .isNumeric()
        .withMessage("Le prix doit être un nombre"),
    );
  } else {
    rules.push(
      body("name")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage(
          "Le nom du service doit faire entre 3 et 50 caractères",
        ),
      body("description").optional({ checkFalsy: true }).trim(),
      body("price")
        .optional({ checkFalsy: true })
        .trim()
        .isNumeric()
        .withMessage("Le prix doit être un nombre"),
    );
  }
  return rules;
};

module.exports = { offerValidationRules };
