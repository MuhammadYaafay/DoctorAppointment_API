INSERT INTO users (name, email, password, role, image_url) VALUES
('Admin User', 'admin@example.com', 'hashed_password_1', 'admin', 'https://example.com/images/admin.jpg'),
('Dr. Alice Smith', 'alice@example.com', 'hashed_password_2', 'doctor', 'https://example.com/images/alice.jpg'),
('John Doe', 'john@example.com', 'hashed_password_3', 'patient', 'https://example.com/images/john.jpg');

INSERT INTO doctors (user_id, specialization, experience, fee, is_approved) VALUES
(2, 'Cardiology', 10, 1500.00, 1);

INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, status, payment_status) VALUES
(3, 2, '2025-04-15', '10:30:00', 'confirmed', 'completed'),
(4, 2, '2025-04-20', '14:00:00', 'pending', 'pending');

INSERT INTO payments (appointment_id, amount, razorpay_order_id, razorpay_payment_id, status) VALUES
(1, 1500.00, 'order_ABC123', 'payment_XYZ123', 'completed'),
(2, 1500.00, 'order_DEF456', NULL, 'pending');
