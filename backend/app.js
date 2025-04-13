const express = require("express");
const cors = require("cors");
const dataRoutes = require("./routes/data.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/data", dataRoutes); // Routes prefixed with /api/data

module.exports = app;
