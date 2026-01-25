import { Job, Worker } from "bullmq";

import redisConnection from "../config/redis.config";
import SubmissionJob from "../jobs/SubmissionJob";

export default function SubmissionWorker(queueName: string) {
    const worker = new Worker(
        queueName,
        async (job?: Job) => {
            if (job?.name === "SubmissionJob") {
                const SubmissionJobInstance = new SubmissionJob(job?.data);
                SubmissionJobInstance.handle(job);

                // return true;
            }
        },
        { connection: redisConnection },
    );
}
