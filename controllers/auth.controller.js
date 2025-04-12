const { validateResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { hashedPassword, comparePassword } = require("../utils/password");

const register = async (req, res) => {
  try {
    const errors = validateResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await hashedPassword(password);

    const [newUser] = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES(?,?,?,?)`,
      [name, email, hashPassword, role || "patient"]
    );

    //doctor register
    if (req.body.role === "doctor") {
      const { specialization, experience, fee } = req.body;
      await pool.query(
        `INSERT INTO doctors(user_id, specialization, experience, fee) VALUES (?, ?, ?, ?)`,
        [newUser.insertId, specialization, experience, fee]
      );
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration failed", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const errors = validateResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email, password } = req.body;

    //if admin
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          id: "admin",
          role: "admin",
        },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );
      return res.json({
        token,
        user: {
          id: "admin",
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    //get user
    const [users] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const user = users[0];

    //check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    //If user is doctor
    let doctorDetails = null;
    if (user.role === "doctor") {
      const [doctors] = await pool.query(
        `SELECT * FROM doctors WHERE user_id = ?`,
        [user.id]
      );
      if (doctors.length > 0) {
        doctorDetails = doctors[0];
      }
    }

    //generate jwt
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        doctorId: doctorDetails?.id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorDetails,
      },
    });
  } catch (error) {
    console.error("login error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProfile = async (req, res) => {
  try {
    //user(patient) details
    const [users] = await pool.query(
      `SELECT id, name, email, role, image_url, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    //doctor details
    if (user.role === "doctor") {
      const [doctors] = await pool.query(
        `SELECT * FROM doctors WHERE user_id = ?`,
        [user.id]
      );

      if (doctors.length > 0) {
        user.doctorDetails = doctors[0];
      }
    }

    //admin details
    if (user.role === "admin") {
      const [admins] = await pool.query(
        `SELECT * FROM admins WHERE user_id = ?`,
        [user.id]
      );
      if (admins.length > 0) {
        user.adminDetails = admins[0];
      }
    }

    res.json(user);
  } catch (error) {
    console.error("get profile error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
