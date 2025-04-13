const { validationResult } = require("express-validator");
const pool = require("../config/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const DOMAIN = process.env.DOMAIN;
console.log("DOMAIN:", process.env.DOMAINN);

const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId, appointmentDate, appointmentTime } = req.body;

    const [doctors] = await pool.query(
      `SELECT * FROM doctors WHERE id = ? AND is_approved=1`,
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    //check if slots available
    const [existingAppointments] = await pool.query(
      `SELECT * FROM appointments WHERE doctor_id = ? 
        AND appointment_date = ? AND appointment_time = ?
        AND status!='cancelled'`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    //create appointment
    const [newAppointment] = await pool.query(
      `INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?)`,
      [req.user.id, doctorId, appointmentDate, appointmentTime]
    );

    // create stripe order

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Use 'usd' in test mode
            product_data: {
              name: `Consultation with Dr. ${doctors[0].name}`,
            },
            unit_amount: doctors[0].fee * 100, // Stripe needs amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${DOMAIN}/payment-success?appointmentId=${newAppointment.insertId}`,
      cancel_url: `${DOMAIN}/payment-cancel`,
      metadata: {
        appointmentId: newAppointment.insertId.toString(),
      },
    });

    //save payment details
    await pool.query(
      `INSERT INTO payments (appointment_id, amount, razorpay_order_id)
        VALUES (?, ?, ?)`,
      [newAppointment.insertId, doctors[0].fee, session.id]
    );

    res.json({
      appointmentId: newAppointment.insertId,
      orderId: order.id,
      amount: doctors[0].fee,
      stripePublicKey: process.env.STRIPE_PUBLISHER_KEY,
    });
  } catch (error) {
    console.log("create appointment errror", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const appointmentId = session.metadata.appointmentId;

      //update payment status
      await pool.query(
        `UPDATE payments SET status = 'paid', razorpay_payment_id = ?
        WHERE razorpay_order_id = ?`,
        [session.payment_intent, session.id]
      );

      //update appointment status
      const [payments] = await pool.query(
        `SELECT appointment_id FROM payments WHERE razorpay_order_id=?`,
        [session.payment_intent]
      );

      await pool.query(
        `UPDATE appointments SET status = ?, payment_status = ? WHERE id = ?`,
        ["confirmed", "completed", appointmentId]
      );
    }

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    console.log({ recieved: true }, "verify payment error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.query(
      `SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.payment_status,
        d.specialization, d.fee,
        u.name as doctor_name, u.email as doctor_email
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );
    res.json(appointments);
  } catch (error) {
    console.log("get user appointments error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    //verify appointment belong to user and is not in past
    const [appointments] = await pool.query(
      `SELECT * FROM appointments WHERE id = ? AND user_id = ? AND appointment_date > CURDATE() AND status != 'cancelled'`,
      [appointmentId, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await pool.query(`UPDATE appointments SET status = ? WHERE id = ?`, [
      "cancelled",
      appointmentId,
    ]);

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log("cancel appointment error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createAppointment,
  verifyPayment,
  getUserAppointments,
  cancelAppointment,
};
