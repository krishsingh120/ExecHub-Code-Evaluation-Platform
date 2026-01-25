const axiosInstance = require("../config/axiosInstance");

async function fetchProblemDetails(problemId) {
  try {
    const URI = "/api/v1/problem";
    const response = await axiosInstance.get(URI + `/${problemId}`);
    //     console.log("Api response", response);

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching problem details:",
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = fetchProblemDetails;
