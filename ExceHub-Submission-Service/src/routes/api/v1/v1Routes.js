const submissionRouter = require("./SubmissionRoutes");

async function v1Plugins(fastify, options) {
  await fastify.register(submissionRouter, { prefix: "/submission" });
}

module.exports = v1Plugins;
