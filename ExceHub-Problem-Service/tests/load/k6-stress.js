import http from "k6/http";
import { check } from "k6";

/**
 * K6 Stress Test (Optional)
 *
 * Gradually increase load to find system breaking point
 * Purpose: System ke limits find out karna
 *
 * Ramps up to 100 VUs and sustains to see when system breaks
 */

export const options = {
  stages: [
    { duration: "1m", target: 20 }, // ramp-up to 20 VUs
    { duration: "1m", target: 50 }, // ramp-up to 50 VUs
    { duration: "1m", target: 100 }, // ramp-up to 100 VUs (stress point)
    { duration: "2m", target: 100 }, // sustain stress load
    { duration: "1m", target: 0 }, // ramp-down
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1/problem";

export default function () {
  // Test 1: Ping
  const pingRes = http.get(`${BASE_URL}/ping`);
  check(pingRes, {
    "ping status 200": (r) => r.status === 200,
  });

  // Test 2: Get All Problems
  const getAllRes = http.get(`${BASE_URL}/`);
  check(getAllRes, {
    "get all status 200": (r) => r.status === 200,
  });

  // Test 3: Create Problem
  const createPayload = JSON.stringify({
    title: "Stress Test Problem",
    description: "Test problem for stress testing system limits",
    difficulty: "hard",
    testCases: [{ input: "test", output: "output", explanation: "test" }],
  });

  const createRes = http.post(`${BASE_URL}/`, createPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createRes, {
    "create status 200/201": (r) => r.status === 200 || r.status === 201,
  });
}
