import express from "express";
const v1Router = express.Router();

import { pingCheck } from "../../controllers/pingController.js";
import submissionRouter from "./submissionRoutes.js";


v1Router.use("/submission", submissionRouter);
v1Router.use("/ping", pingCheck);


export default v1Router;
