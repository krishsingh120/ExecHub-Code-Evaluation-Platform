const mongoose = require("mongoose");
// const { ProblemRepository, ProblemRepository } = require("../repositories/index");
const sanitizeMarkdownContent = require("../utils/markdownSanitizer");
const BadRequest = require("../errors/badrequest.error");


class ProblemService {
    constructor(problemRepository) {
        this.problemRepository = problemRepository;
    }

    // create problem 
    async createProblem(problemData) {
        try {
            // 1. sanitized the markdown for description
            problemData.description = await sanitizeMarkdownContent(problemData.description);

            const problem = await this.problemRepository.createProblem(problemData);

            return problem;
        } catch (error) {
            console.log("Problem service Error", error);
            throw error;
        }
    }

    // get all problems
    async getAllProblem() {
        try {
            const allProblems = await this.problemRepository.getAllProblem();
            return allProblems;
        } catch (error) {
            console.log("Problem service Error", error);
            throw error;
        }
    }

    // get problem 
    async getProblem(problemId) {
        try {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(problemId)) {
                throw new BadRequest(`Problem id format: ${problemId}`, problemId);
            }

            const problem = await this.problemRepository.getProblem(problemId);
            return problem;
        } catch (error) {
            console.log("Problem service Error", error);
            throw error;
        }
    }

    // update problem
    async updateProblem(problemData, problemId) {
        try {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(problemId)) {
                throw new BadRequest(`Problem id format: ${problemId}`, problemId);
            }

            // 1. sanitized the markdown for description
            problemData.description = sanitizeMarkdownContent(problemData.description);

            const updatedProblem = await this.problemRepository.updateProblem(problemData, problemId);
            return updatedProblem;
        } catch (error) {
            console.log("Problem service Error", error);
            throw error;
        }
    }


    // delete problem
    async deleteProblem(problemId) {
        try {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(problemId)) {
                throw new BadRequest(`Problem id format: ${problemId}`, problemId);
            }

            const deletedProblem = await this.problemRepository.deleteProblem(problemId);
            return deletedProblem;
        } catch (error) {
            console.log("Problem service Error", error);
            throw error;
        }
    }
}

module.exports = ProblemService;