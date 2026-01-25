import http from "k6/http";
import { check } from "k6";

/**
 * K6 Smoke Test
 *
 * Very low traffic - Basic check: System up hai ya nahi
 * Purpose: Verify that the API is running and responding
 */

export const options = {
  stages: [
    { duration: "30s", target: 1 }, // 1 user for 30 seconds
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1/problem";

export default function () {
  // Test 1: Ping endpoint - Health check
  const pingRes = http.get(`${BASE_URL}/ping`);
  check(pingRes, {
    "ping status 200": (r) => r.status === 200,
  });

  // Test 2: Get all problems
  const getAllRes = http.get(`${BASE_URL}/`);
  check(getAllRes, {
    "get all status 200": (r) => r.status === 200,
  });

  // Test 3: Create a problem
  const createPayload = JSON.stringify({
    title: "Smoke Test Problem",
    description: "Basic smoke test",
    difficulty: "easy",
    testCases: [{ input: "test", output: "output", explanation: "test" }],
  });

  const createRes = http.post(`${BASE_URL}/`, createPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createRes, {
    "create status 200/201": (r) => r.status === 200 || r.status === 201,
  });
}
