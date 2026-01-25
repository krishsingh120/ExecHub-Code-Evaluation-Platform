import express from "express";
const pingRouter = express.Router();

import { pingCheck } from "../../controllers/pingController.js";


pingRouter.get("/", pingCheck);


export default pingRouter;
