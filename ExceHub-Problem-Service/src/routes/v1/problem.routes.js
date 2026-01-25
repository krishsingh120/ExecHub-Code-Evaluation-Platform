const express = require("express");
const problemRouter = express.Router();
const { problemController } = require("../../controllers/index");



// ping route
problemRouter.get('/ping', problemController.pingController);


// create problem route
problemRouter.post('/', problemController.addProblem);


// get problem route
problemRouter.get('/:id', problemController.getProblem);


// get all problems route
problemRouter.get('/', problemController.getProblems);


// update problem route
problemRouter.put('/:id', problemController.updateProblem);


// delete problem route
problemRouter.delete('/:id', problemController.deleteProblem);




module.exports = problemRouter;