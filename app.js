const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const routes = require("./routes/routes");
const userRoutes = require("./routes/userRoutes");
const compression = require("compression");

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
const PORT = process.env.PORT || 8080;


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

