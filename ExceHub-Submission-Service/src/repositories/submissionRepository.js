const Submission = require("../models/submissionModel");

class SubmissionRepository {
  constructor() {
    this.submissionModel = Submission;
  }

  async createSubmission(submissionPayload) {
    try {
      const response = await this.submissionModel.create(submissionPayload);
      return response;
    } catch (error) {
      console.log("Something went wrong in submission repository");
      console.log(error);
    }
  }

  // TODO: updateSubmission -> Done
  async updateSubmission(payload) {
    try {
      const { response, userId, submissionId } = payload;
      const submission = await this.submissionModel.findOne({
        _id: submissionId,
        userId,
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      if (submission.status.toLowerCase() !== "PENDING".toLowerCase()) {
        throw new Error(
          `Invalid state transition: ${submission.status} → SUCCESS`
        );
      }

      submission.status = response.status;
      await submission.save();

      return submission;
    } catch (error) {
      console.log("Something went wrong in submission repository");
      console.log(error);
    }
  }
}

module.exports = SubmissionRepository;
