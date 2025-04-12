const { body } = require("express-validator");

//validation for registration
const regiserValidation = [
  body("name").notEmpty().trim().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long"),
  body("role")
    .optional()
    .isIn(["admin", "doctor", "patient"])
    .withMessage("invalid role"),
  body("specialization")
    .if(body("role").equals("doctor"))
    .notEmpty()
    .withMessage("Specialization is required for doctors"),
  body("experience")
    .if(body("role").equals("doctor"))
    .isInt({ min: 0 })
    .withMessage("Valid experience is required for doctors"),
  body("fee")
    .if(body("role").equals("doctor"))
    .isFloat({ min: 0 })
    .withMessage("Valid fee is required for doctors"),
];

//for login
const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  regiserValidation,
  loginValidation,
};
