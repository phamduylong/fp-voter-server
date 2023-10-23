const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const routes = require("./routes/routes");
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const compression = require("compression");
const path = require("path");
const logger = require("./utilities/logger");
/* MIDDLEWARES */

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use(bodyParser.json());
const mongoUri = process.env.MONGODB_URI;
app.all('*', function (req, res, next) {
  res.set({
    "Connection": "Keep-Alive",
    "Keep-Alive": "timeout=5, max=1000",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  next();
});
app.use("/", routes);
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);
const PORT = process.env.PORT || 8080;
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Clear old logs every 24 hours
// Read every logs and parse timestamp, then filter out logs older than 24 hours
// Write back remaining logs to file
const clearLogsCallback = () => {
  fs.readFile(path.join(__dirname, "logFiles/api.log"), "utf8", (err, data) => {
    if (err) logger.warn("Failed to read old logs. Error: ", err);
    const lines = data.split("\r\n");
    const filteredLines = lines.filter(line => {
      return Date.now() - new Date(line.substring(1, 24)).getTime() < ONE_DAY_IN_MILLISECONDS;
    });
    fs.writeFile(path.join(__dirname, "logFiles/api.log"), filteredLines.join("\r\n"), (err) => {
      if (err) logger.warn("Failed to write remaining logs back after clearing old logs. Error: ", err);
    });
  });
}

// for ease of debugging, can be deleted later if necessary
clearLogsCallback();

setInterval(() => {
  clearLogsCallback();
}, ONE_DAY_IN_MILLISECONDS);

mongoose.connect(mongoUri)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    if (mongoUri === undefined || mongoUri === "") {
      logger.fatal("Failed to connect to MongoDB. Failure reason: MONGODB_URI is missing from .env file.");
    } else logger.fatal("Failed to connect to MongoDB. Failure reason: ", error);
  });

module.exports = app.listen(PORT, () => {
  logger.info(`Server is up and running on port ${PORT}`);
});

