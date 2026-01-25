const fetchProblemDetails = require("../apis/ProblemServiceApi");
const SubmissionProducers = require("../producers/submissionQueueProducer");

class SubmissionService {
  constructor(submissionRepository) {
    // inject some here
    this.submissionRepository = submissionRepository;
  }

  async pingCheck() {
    return "pong";
  }

  async addSubmission(submissionPayload) {
    console.log("Submission service hit");

    // Hit the Problem Admin service and fetch the problem details.
    const problemId = submissionPayload.problemId;
    const userId = submissionPayload.userId;
    // console.log(problemId);

    const problemAdminApiResponse = await fetchProblemDetails(problemId);

    if (!problemAdminApiResponse) {
      throw new { message: "Failed to create submission in repository" }();
    }
    console.log("Api response is: ", problemAdminApiResponse.data.codeStubs);

    // According to client language choice find the codeStub.
    const languageCodeStubs = problemAdminApiResponse.data.codeStubs.find(
      (codeStub) =>
        codeStub.language.toLowerCase() ===
        submissionPayload.language.toLowerCase()
    );

    console.log("Language code stubs: ", languageCodeStubs);

    submissionPayload.code =
      languageCodeStubs.startSnippet +
      "\n\n" +
      submissionPayload.code +
      "\n\n" +
      languageCodeStubs.endSnippet;

    // we are going to create the entry in db.

    const submission = await this.submissionRepository.createSubmission(
      submissionPayload
    );

    if (!submission) {
      // TODO: Add error handling
      throw new { message: "Not able to create submission" }();
    }
    // console.log("this is submission response: ",submission);

    // Added payload in submission queue
    const response = await SubmissionProducers({
      [submission._id]: {
        code: submission.code,
        language: submission.language,
        inputCase: problemAdminApiResponse.data.testCases[0].input,
        outputCase: problemAdminApiResponse.data.testCases[0].output,
        userId: userId,
        submissionId: submission._id,
      },
    });

    // TODO: Add handling of all testcases here.

    return { queueResponse: response, submission };
  }

  // TODO: Update submission - Done
  async updateSubmission(payload) {
    try {
      const response = await this.submissionRepository.updateSubmission(
        payload
      );
      return response;
    } catch (error) {
      console.log("Something went wrong in submission service");
      console.log(error);
    }
  }
}

module.exports = SubmissionService;
