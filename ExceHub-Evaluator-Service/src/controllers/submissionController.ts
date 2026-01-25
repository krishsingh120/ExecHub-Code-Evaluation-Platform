import { Request, Response } from "express";
import { CreateSubmissionDtos } from "../dtos/createSubmissionDtos.js";

export async function addSubmission(req: Request, res: Response) {
    try {
        const submissionDtos = req.body as CreateSubmissionDtos;

        return res.status(201).json({
            success: true,
            error: {},
            message: "successfully collect the submission",
            data: submissionDtos,
        });
    } catch (error) {
        console.log(error);
    }
}
