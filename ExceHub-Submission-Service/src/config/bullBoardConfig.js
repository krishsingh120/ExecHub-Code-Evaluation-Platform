const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { FastifyAdapter } = require("@bull-board/fastify");
const SubmissionQueue = require("../queues/SubmissionQueue");

const serverAdapter = new FastifyAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(SubmissionQueue)],
  serverAdapter: serverAdapter,
});


module.exports = serverAdapter;