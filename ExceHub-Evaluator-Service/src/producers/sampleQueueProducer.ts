import sampleQueue from "../queues/sampleQueue.js";

export default async function (name: string, payload: Record<string, unknown>, priority: number) {
    // QueueName.add(jobName, {})
    await sampleQueue.add(name, payload, { priority });
    console.log("Successfully Added a new job");
}
