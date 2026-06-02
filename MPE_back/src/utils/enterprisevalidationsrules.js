const { body } = require("express-validator");
const { sequelize } = require("../../models/index");
const Enterprise = sequelize.models.Enterprise;

const enterpriseValidationRules = (isUpdate = false) => {
  const rules = [];
  if (!isUpdate) {
    rules.push(
      body("name")
        .notEmpty()
        .withMessage("Le nom d'entreprise est obligatoire")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage(
          "Votre nom d'entreprise doit être compris entre 3 et 50 caractères",
        )
        .custom(async (name) => {
          const existingEnterprise = await Enterprise.findOne({
            where: { name },
          });
          if (existingEnterprise) {
            return Promise.reject("Le nom d'entreprise existe déjà");
          }
        }),
      body("mail")
        .notEmpty()
        .withMessage("L'email est obligatoire")
        .trim()
        .isEmail()
        .withMessage("Email invalide")
        .custom(async (mail) => {
          const existingEmail = await Enterprise.findOne({ where: { mail } });
          if (existingEmail) {
            return Promise.reject("L'email existe déjà");
          }
        }),
      body("Job_id")
        .notEmpty()
        .withMessage("Le secteur d'activité est obligatoire"),
      body("Country_id")
        .notEmpty()
        .withMessage("La région est obligatoire"),
      body("phone")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10 })
        .withMessage("Le numéro de téléphone doit contenir au moins 10 chiffres"),
      body("adress").optional({ checkFalsy: true }).bail().trim(),
      body("city").optional({ checkFalsy: true }).trim(),
      body("zip_code")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 5 })
        .withMessage("Le code postal doit contenir exactement 5 chiffres"),
      body("siret_number")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 14, max: 14 })
        .withMessage("Le numéro SIRET doit contenir exactement 14 chiffres"),
      body("description")
        .notEmpty()
        .withMessage("La description est obligatoire")
        .bail()
        .trim(),
      body("website").optional({ checkFalsy: true }).trim().isURL().withMessage("URL de site invalide"),
      body("facebook").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Facebook invalide"),
      body("instagram").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Instagram invalide"),
      body("twitter").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Twitter invalide"),
    );
  } else {
    rules.push(
      body("name")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage(
          "Votre nom d'entreprise doit être compris entre 3 et 50 caractères",
        )
        .custom(async (name) => {
          const existingEnterprise = await Enterprise.findOne({
            where: { name },
          });
          if (existingEnterprise) {
            return Promise.reject("Le nom d'entreprise existe déjà");
          }
        }),
      body("mail")
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage("Email invalide")
        .custom(async (mail) => {
          const existingEmail = await Enterprise.findOne({ where: { mail } });
          if (existingEmail) {
            return Promise.reject("L'email existe déjà");
          }
        }),
      body("phone")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10 })
        .withMessage("Le numéro de téléphone doit contenir au moins 10 chiffres"),
      body("adress").optional({ checkFalsy: true }).trim(),
      body("city").optional({ checkFalsy: true }).trim(),
      body("zip_code")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 5 })
        .withMessage("Le code postal doit contenir exactement 5 chiffres"),
      body("siret_number")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 14, max: 14 })
        .withMessage("Le numéro SIRET doit contenir exactement 14 chiffres"),
      body("description").optional({ checkFalsy: true }).bail().trim(),
      body("website").optional({ checkFalsy: true }).trim().isURL().withMessage("URL de site invalide"),
      body("facebook").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Facebook invalide"),
      body("instagram").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Instagram invalide"),
      body("twitter").optional({ checkFalsy: true }).trim().isURL().withMessage("URL Twitter invalide"),
    );
  }
  return rules;
};

module.exports = { enterpriseValidationRules };
