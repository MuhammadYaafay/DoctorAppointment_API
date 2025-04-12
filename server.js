const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db.js");
const adminRoutes = require('./routes/admin.routes.js')
const authRoutes = require('./routes/auth.routes.js')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
