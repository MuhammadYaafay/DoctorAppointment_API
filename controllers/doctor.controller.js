const { validationResult } = require("express-validator");
const pool = require("../config/db");

const getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT 
        d.id, d.specialization, d.experience, d.fee, d.is_approved,
        u.name, u.email, u.image_url
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.is_approved = true`
    );
    res.json(doctors);
  } catch (error) {
    console.error("get doctors error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT
            d.id, d.specialization, d.experience, d.fee, d.is_approved,
            u.name, u.email, u.image_url
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ? AND d.is_approved = 1`,
      [req.params.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctors[0]);
  } catch (error) {
    console.error("get doctor by id error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { specialization, experience, fee } = req.body;

    const [doctors] = await pool.query(
      `SELECT * FROM doctors WHERE id = ? AND user_id = ?`,
      [req.user.doctorId, req.user.id]
    );
    if (doctors.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await pool.query(
      `UPDATE doctors 
        SET specialization = ?, experience = ?, fee = ?
        WHERE id = ?`,
      [specialization, experience, fee, req.user.doctorId]
    );
    res.json({ message: "Doctor profile updated successfully" });
  } catch (error) {
    console.error("update doctor profile error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.query(
      `SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.payment_status,
        u.name as patient_name, u.email as patient_email
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.doctorId]
    );
    console.log(appointments)
    res.json(appointments);
  } catch (error) {
    console.error("get doctor appointments error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [appointments] = await pool.query(
      `SELECT * FROM appointments WHERE id = ? AND doctor_id = ?`,
      [appointmentId, req.user.doctorId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [
      status,
      appointmentId,
    ]);

    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    console.error("update appointment status error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
};
