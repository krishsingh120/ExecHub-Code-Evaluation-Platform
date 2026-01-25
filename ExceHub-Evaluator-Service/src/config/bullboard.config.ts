import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

// import YOUR queue
import SampleQueue from "../queues/sampleQueue.js";
import submissionQueue from "../queues/submissionQueue.js";
import evaluationQueue from "../queues/evaluationQueue.js";

const serverAdapter = new ExpressAdapter();

// URL where Bull Board will be available
serverAdapter.setBasePath("/admin/bull-board");

createBullBoard({
    queues: [
        new BullMQAdapter(SampleQueue),
        new BullMQAdapter(submissionQueue),
        new BullMQAdapter(evaluationQueue),
    ],
    serverAdapter,
});

export default serverAdapter;
