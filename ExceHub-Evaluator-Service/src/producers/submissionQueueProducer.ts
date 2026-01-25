import submissionQueue from "../queues/submissionQueue.js";

export default async function (payload: Record<string, unknown>) {
    // QueueName.add(jobName, {})
    await submissionQueue.add("SubmissionJob", payload);
    console.log("Successfully Added a new submission job");
}
