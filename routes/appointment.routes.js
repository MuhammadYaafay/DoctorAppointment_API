const express = require("express");
const {
  createAppointment,
  verifyPayment,
  getUserAppointments,
  cancelAppointment,
} = require("../controllers/appointment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  appointmentValidation,
} = require("../middlewares/appointmentValidation.middleware");

const router = express.Router();

//protected
router.post("/create", verifyToken, appointmentValidation, createAppointment);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/user", verifyToken, getUserAppointments);
router.patch("/:id/cancel", verifyToken, cancelAppointment);

module.exports = router;
