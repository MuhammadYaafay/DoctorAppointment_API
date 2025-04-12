const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const {
  getDashboardStats,
  getPendingDoctors,
  approveDoctorRegistration,
  getAllUsers,
  getAllAppointments,
  cancelAppointmentByAdmin,
} = require("../controllers/admin.controller");

const router = express.Router();

//all routes require admin authentication
router.use(verifyToken, isAdmin);

//dashboard and stats
router.get('/dashboard', getDashboardStats);

//Doctor management 
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/approve', approveDoctorRegistration);

//user management
router.get('/users', getAllUsers);

//appointment management
router.get('/appointements', getAllAppointments);
router.patch('/appointements/:id/cancel', cancelAppointmentByAdmin);

module.exports = router;
