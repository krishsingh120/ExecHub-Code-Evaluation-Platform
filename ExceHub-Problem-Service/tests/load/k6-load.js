import http from "k6/http";
import { check } from "k6";

/**
 * K6 Load Test - Expected Real Traffic
 *
 * Test scenarios:
 * 1. Constant Load (10 VUs for 2 minutes)
 * 2. Ramp Load (0 to 20 VUs over 1 minute, sustained 2 minutes, ramp down)
 * 3. Peak Load (0 to 50 VUs for spike testing)
 */

export const options = {
  stages: [
    // Constant Load: 10 VUs for 2 minutes
    { duration: "2m", target: 10 },
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1/problem";

export default function () {
  // Test 1: Ping
  const pingRes = http.get(`${BASE_URL}/ping`);
  check(pingRes, {
    "ping status 200": (r) => r.status === 200,
    "ping response time < 200ms": (r) => r.timings.duration < 200,
  });

  // Test 2: Get All Problems
  const getAllRes = http.get(`${BASE_URL}/`);
  check(getAllRes, {
    "get all status 200": (r) => r.status === 200,
    "get all response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Test 3: Create Problem
  const createPayload = JSON.stringify({
    title: "Load Test Problem",
    description: "Test problem for load testing",
    difficulty: "easy",
    testCases: [{ input: "test", output: "output", explanation: "test" }],
  });

  const createRes = http.post(`${BASE_URL}/`, createPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createRes, {
    "create status 200/201": (r) => r.status === 200 || r.status === 201,
    "create response time < 500ms": (r) => r.timings.duration < 500,
  });
}
