const { body } = require("express-validator");

const updateProfileValidation = [
  body("specialization").notEmpty().withMessage("Specialization is required"),
  body("experience")
    .isInt({ min: 0 })
    .withMessage("Valid experience is required"),
  body("fee").isFloat({ min: 0 }).withMessage("Valid fee is required"),
];

module.exports = {
  updateProfileValidation,
};
