const { body } = require("express-validator");

const appointmentValidation = [
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .withMessage("Appointment date must be today or in the future"),
  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
];

module.exports = {
    appointmentValidation,
}
