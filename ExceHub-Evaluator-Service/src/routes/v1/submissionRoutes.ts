import express from "express";
const submissionRouter = express.Router();

import { addSubmission } from "../../controllers/submissionController.js";
import { validate } from "../../validators/zodValidator.js";
import { CreateSubmissionZodSchema } from "../../dtos/createSubmissionDtos.js";

submissionRouter.post("/", validate(CreateSubmissionZodSchema), addSubmission);

export default submissionRouter;
