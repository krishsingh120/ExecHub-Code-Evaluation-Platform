const express = require("express");
const v1Router = express.Router();

const problemRoutes = require("./problem.routes");

// /api/v1/problem...
v1Router.use("/problem", problemRoutes);


module.exports = v1Router;