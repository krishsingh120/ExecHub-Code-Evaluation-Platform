import http from "k6/http";
import { check } from "k6";

/**
 * K6 Ramp Load Test
 *
 * Gradually increase load from 0 to 20 VUs over 1 minute
 * Sustain for 2 minutes, then ramp down
 *
 * Purpose: Test how system handles gradually increasing traffic
 */

export const options = {
  stages: [
    { duration: "1m", target: 20 }, // ramp-up to 20 VUs
    { duration: "2m", target: 20 }, // stay at 20 VUs
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
    title: "Ramp Test Problem",
    description: "Test problem for ramp load testing",
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
