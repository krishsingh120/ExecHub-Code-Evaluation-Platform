import http from "k6/http";
import { check } from "k6";

/**
 * K6 Peak Load Test
 *
 * Quickly ramp up to peak traffic (50 VUs) and sustain
 * Purpose: Test system performance during traffic spike
 *
 * Simulates sudden increase in users (like during product launch/promotion)
 */

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // quick ramp-up to 50 VUs
    { duration: "2m", target: 50 }, // sustain peak load
    { duration: "1m", target: 0 }, // ramp-down
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1/problem";

export default function () {
  // Test 1: Ping
  const pingRes = http.get(`${BASE_URL}/ping`);
  check(pingRes, {
    "ping status 200": (r) => r.status === 200,
    "ping response time < 300ms": (r) => r.timings.duration < 300,
  });

  // Test 2: Get All Problems
  const getAllRes = http.get(`${BASE_URL}/`);
  check(getAllRes, {
    "get all status 200": (r) => r.status === 200,
    "get all response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Test 3: Create Problem
  const createPayload = JSON.stringify({
    title: "Peak Load Test Problem",
    description: "Test problem for peak load testing",
    difficulty: "medium",
    testCases: [{ input: "test", output: "output", explanation: "test" }],
  });

  const createRes = http.post(`${BASE_URL}/`, createPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createRes, {
    "create status 200/201": (r) => r.status === 200 || r.status === 201,
    "create response time < 600ms": (r) => r.timings.duration < 600,
  });
}
