import express from "express";
const apiRouter = express.Router();

import v1Router from "./v1/index.js";
import submissionRouter from "./v1/submissionRoutes.js";

apiRouter.use("/v1", v1Router);

export default apiRouter;
