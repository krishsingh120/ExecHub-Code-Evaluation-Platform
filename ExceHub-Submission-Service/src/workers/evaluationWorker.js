const { Worker } = require("bullmq");
const axios = require("axios");

const redisConnection = require("../config/redisConfig");
const SubmissionRepository = require("../repositories/submissionRepository");
const SubmissionService = require("../services/submissionService");

const submissionService = new SubmissionService(new SubmissionRepository());

function evaluationWorker(queueName) {
  new Worker(
    queueName,
    async (job) => {
      if (job.name === "EvaluationJob") {
        // console.log("Evaluation job is : ", job.data);

        try {
          // TODO(Step 11): also update the DB PENDING to SUCCESS -> Done
          const payload = job.data;

          const { response, userId, submissionId } = payload;

          if (response.status.toLowerCase() === "SUCCESS".toLowerCase()) {
            // console.log("success working");

            const updateDB = await submissionService.updateSubmission(payload);
            // console.log("Update DB Successfully", updateDB);

            return updateDB;
          }

          // This is 12-step is complete/final flow
          const socketResponse = await axios.post(
            "http://localhost:4000/sendPayload",
            {
              userId: userId,
              payload: payload,
            }
          );
          // console.log(socketResponse);
          // console.log(job.data);
        } catch (error) {
          console.log(error);
        }
      }
    },
    {
      connection: redisConnection,
    }
  );
}

module.exports = evaluationWorker;
