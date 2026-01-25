const logger = require("../config/logger.config");
const NotFound = require("../errors/notfound.error");
const { Problem } = require("../models/index");

class ProblemRepository {
    // create problem
    async createProblem(problemData) {
        try {
            const problem = await Problem.create({
                title: problemData.title,
                description: problemData.description,
                testCases: (problemData.testCases) ? problemData.testCases : [],
                difficulty: problemData.difficulty,
                codeStubs: problemData.codeStubs,
                editorial: problemData.editorial
            })
            return problem;
        } catch (error) {
            console.log("Problem repository Error", error);
            throw error;
        }
    }

    // get all problems
    async getAllProblem() {
        try {
            const allProblems = await Problem.find({}); // {} -> this is for filtration
            return allProblems;
        } catch (error) {
            console.log("Problem repository Error", error);
            throw error;
        }
    }

    // get problem
    async getProblem(id) {
        try {
            const problem = await Problem.findById(id);
            console.log(problem);

            if (!problem) {
                throw new NotFound("Problem", id);
            }
            return problem;
        } catch (error) {
            console.log("Problem repository Error", error);
            throw error;
        }
    }


    // update problem
    async updateProblem(data, id) {
        try {
            const updatedProblem = await Problem.findByIdAndUpdate(id, data, {
                new: true,    // return the updated document
                runValidators: true,   // run schema validation on update
            })

            if (!updatedProblem) {
                throw new NotFound("Problem", { "data": data, "id": id });
            }

            return updatedProblem;
        } catch (error) {
            console.log("Problem repository Error", error);
            throw error;
        }
    }


    // delete problem
    async deleteProblem(id) {
        try {
            const deletedProblem = await Problem.findByIdAndDelete(id);

            if (!deletedProblem) {
                logger.error(`Problem.Repository : Problem with id : ${id} not found int the DB`);
                throw new NotFound("Problem", id);
            }

            return deletedProblem;
        } catch (error) {
            console.log("Problem repository Error", error);
            throw error;
        }
    }

}

module.exports = ProblemRepository;