import { Job } from "bullmq";

import runCpp from "../containers/cppExecutor.js";
import runJava from "../containers/javaExecutor.js";
import { IJob } from "../types/bullMqJobDefinition.js";
import runPython from "../containers/pythonExecutor.js";
import createExecutor from "../utils/ExecutorFactory.js";
import { submissionPayload } from "../types/submissionPayload.js";
import evaluationQueueProducer from "../producers/evaluationQueueProducer.js";
import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy.js";

export default class SubmissionJob implements IJob {
    name: string;
    payload: submissionPayload;

    constructor(payload: submissionPayload) {
        this.name = this.constructor.name;
        this.payload = payload;
    }

    handle = async (job?: Job): Promise<void> => {
        console.log("Handler of the job called");
        console.log("Payload is : ", this.payload);
        // console.log("Payload is : ", this.payload.language);
        // console.log("Payload is : ", this.payload.inputCase);

        if (job) {
            const key = Object.keys(this.payload)[0];

            // console.log("key is this : ",this.payload[key]);

            const { code, language, inputCase, outputCase, userId, submissionId } =
                this.payload[key];

            // console.log(code, language, inputCase, outputCase);

            const strategy = createExecutor(language);

            // console.log(strategy);

            if (strategy != null) {
                const response: ExecutionResponse = await strategy.execute(
                    code,
                    inputCase,
                    outputCase,
                );

                evaluationQueueProducer({ response, userId, submissionId });

                if (response.status === "SUCCESS") {
                    console.log("code executed successfully");
                    console.log(response);
                } else {
                    console.log("Something went wrong with code execution");
                    console.log(response);
                }
            }
        }

        // if (!job) return;

        // let submission: submissionPayload | undefined;

        // // 1. Object.entries(this.payload) => this convert object of objects to array of arrays
        // // 2. [, value] => Ignores the key
        // for (const [, value] of Object.entries(this.payload)) {
        //     submission = value;
        //     break;
        // }

        // if (!submission) return;
        // console.log("Submission is : ", submission);

        // const { code, language, inputCase, outputCase } = submission;

        // console.log(code, language, inputCase, outputCase);

        // const strategy = createExecutor(language);
        // if (!strategy) return;

        // const response: ExecutionResponse = await strategy.execute(code, inputCase, outputCase);

        // if (response.status === "COMPLETED") {
        //     console.log("code executed successfully");
        //     console.log(response);
        // } else {
        //     console.log("Something went wrong with code execution");
        //     console.log(response);
        // }
    };

    failed = async (job?: Job): Promise<void> => {
        console.log("Job failed");
        if (job) {
            console.log("Job ID:", job.id);
        }
    };
}
