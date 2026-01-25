const NotImplemented = require("../errors/notImplemented.error");
const { ProblemService } = require("../services/index");
const { ProblemRepository } = require("../repositories/index");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger.config");

const problemService = new ProblemService(new ProblemRepository());


function pingController(req, res) {
    // logger.log("ping error log from ping controller")
    return res.json({ message: "ping controller is up" });
}

async function addProblem(req, res, next) {
    try {
        const newProblem = await problemService.createProblem(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Successfully create a new problem",
            error: {},
            data: newProblem,
        })
    } catch (error) {
        next(error);
    }
}

async function getProblem(req, res, next) {
    try {
        const problem = await problemService.getProblem(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched a problem",
            error: {},
            data: problem,
        })
    } catch (error) {
        next(error);
    }
}

async function getProblems(req, res, next) {
    try {
        const allProblems = await problemService.getAllProblem();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all problems",
            error: {},
            data: allProblems,
        })
    } catch (error) {
        next(error);
    }
}

async function deleteProblem(req, res, next) {
    try {
        const response = await problemService.deleteProblem(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully delete a problem",
            error: {},
            data: response,
        })
    } catch (error) {
        next(error);
    }
}

async function updateProblem(req, res, next) {
    try {
        const response = await problemService.updateProblem(req.body, req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully update a problem",
            error: {},
            data: response,
        })
    } catch (error) {
        next(error);
    }
}


module.exports = {
    pingController,
    addProblem,
    getProblem,
    getProblems,
    deleteProblem,
    updateProblem
}