// const TestService = require("../services/testService");
// const testService = new TestService();

/*
  ## Mistake you made:
   - You tried to access `this.testService` inside the controller.
   - But controllers are NOT class methods, so `this` does NOT point to Fastify instance.
   - That's why `this.testService` was coming as undefined.

  ## Correct approach:
   - When a service is decorated in Fastify using fastify.decorate(),
   - it becomes available on `req.server` inside the route handlers.
   - So always access it using: req.server.testService
*/

const pingRequest = async (req, res) => {
  // Now this will correctly print your decorated service
  console.log(req.server.testService);

  // Correct way to call the service method
  const response = await req.server.testService.pingCheck();

  return res.status(200).send({ data: response });
};

// TODO: Add validation layer
async function createSubmission(req, res) {
  // console.log("Submission controller hit");

  const submission = await this.submissionService.addSubmission(req.body);

  return res.status(200).send({
    success: true,
    message: "Created submission successfully",
    error: {},
    response: submission,
  });
}

module.exports = {
  pingRequest,
  createSubmission,
};
