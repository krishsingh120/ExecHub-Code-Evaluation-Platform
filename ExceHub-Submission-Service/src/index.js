const fastify = require("fastify")({ logger: false }); // calling the fastify constructor

const app = require("./app");
const connectToDB = require("./config/dbConfig");
const { PORT } = require("./config/serverConfig");
const evaluationWorker = require("./workers/evaluationWorker");

fastify.register(app);

fastify.get("/", (req, res) => {
  return res.send({ message: "OK" });
});

fastify.get("/home", function (req, res) {
  return { message: "HOME" };
});

const start = async () => {
  try {
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0",
    });
    console.log(`Server is listening on http://localhost:${PORT}`);
    console.log(
      `Bull UI -> is listening on http://localhost:${PORT}/admin/queues`
    );
    await connectToDB();
    console.log("🚀 Successfully connect to DB");

    // call evaluation worker
    evaluationWorker("EvaluationQueue");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
