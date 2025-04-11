const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Connection } = require('./db/connection');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json())

Connection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
