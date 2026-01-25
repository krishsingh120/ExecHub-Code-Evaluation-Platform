const SubmissionQueue = require("../queues/SubmissionQueue");

module.exports = async function (payload) {
  await SubmissionQueue.add("SubmissionJob", payload);
  console.log("Successfully added a new submission job");
};
