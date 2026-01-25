const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const apiRouter = require("./routes/index");
const { PORT } = require("./config/server.config");
const BaseError = require("./errors/base.error.js");
const { errorHandler } = require("./utils/index.js");
const DBConnector = require("./config/db.config.js");
const logger = require("./config/logger.config.js");

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

// /api/v1/....
app.use("/api", apiRouter);

// Routes setup
app.get("/ping", (req, res) => res.send("hello ping is here."));

// last middleware if any error comes
app.use(errorHandler);

app.listen(PORT, async () => {
  // console.log(`Server is listening on port http://localhost:${PORT}`);
  logger.info(`Server is listening on port http://localhost:${PORT}`);
  await DBConnector.connect();
  logger.info(`🚀 Successfully connected to DB`);
  // console.log("🚀 Successfully connected to DB");
});
