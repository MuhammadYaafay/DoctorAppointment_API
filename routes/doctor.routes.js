const express = require("express");
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/doctor.controller");
const { verifyToken, isDoctor } = require("../middlewares/auth.middleware");
const {
  updateProfileValidation,
} = require("../middlewares/docUpdateProfileValidation.middleware");

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

//for doctors protected
router.put(
  "/profile",
  verifyToken,
  isDoctor,
  updateProfileValidation,
  updateDoctorProfile
);
router.get("/appointments/list", verifyToken, isDoctor, getDoctorAppointments);
router.patch(
  "/appointments/:id/status",
  verifyToken,
  isDoctor,
  updateAppointmentStatus
);

module.exports = router;
