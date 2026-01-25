# K6 Load Testing - ExceHub Problem Service

Complete load testing suite using K6 for ExceHub Problem Service API endpoints.

**Base URL:** `http://localhost:3000/api/v1/problem`

---

## 📋 All Tests Overview

| #   | Test Name       | File           | VUs   | Duration | Purpose                                   |
| --- | --------------- | -------------- | ----- | -------- | ----------------------------------------- |
| 1   | **Smoke Test**  | `k6-smoke.js`  | 1     | 30s      | Quick health check - Is system running?   |
| 2   | **Load Test**   | `k6-load.js`   | 10    | 2m       | Normal traffic - Expected real-world load |
| 3   | **Ramp Test**   | `k6-ramp.js`   | 0→20  | 4m       | Gradual increase - How system scales      |
| 4   | **Peak Test**   | `k6-peak.js`   | 0→50  | 3.5m     | Sudden spike - Product launch scenario    |
| 5   | **Stress Test** | `k6-stress.js` | 0→100 | 6m       | Find limits - Where does system break     |

---

## 🚀 How to Run Tests

### Run Smoke Test (Health Check)

```bash
k6 run tests/load/k6-smoke.js
```

**What it does:** Quick sanity check with 1 user for 30 seconds

- Tests: Ping, Get All Problems, Create Problem

---

### Run Load Test (Normal Traffic)

```bash
k6 run tests/load/k6-load.js
```

**What it does:** Constant 10 users for 2 minutes (simulates normal traffic)

- Tests: Ping, Get All Problems, Create Problem
- **RUN THIS DAILY** ✅

---

### Run Ramp Test (Gradual Load)

```bash
k6 run tests/load/k6-ramp.js
```

**What it does:** Gradually increase from 0→20 users over 1 minute, sustain 2 minutes, ramp down

- Tests: Ping, Get All Problems, Create Problem
- **RUN THIS WEEKLY** for scalability check

---

### Run Peak Test (Traffic Spike)

```bash
k6 run tests/load/k6-peak.js
```

**What it does:** Quick spike to 50 users for 2 minutes (product launch scenario)

- Tests: Ping, Get All Problems, Create Problem
- **RUN BEFORE MAJOR RELEASES**

---

### Run Stress Test (Find Breaking Point)

```bash
k6 run tests/load/k6-stress.js
```

**What it does:** Escalate to 100 users to find system breaking point

- Tests: Ping, Get All Problems, Create Problem
- **OPTIONAL** - Run only before major events

---

## 🎯 Run by Environment

### Development (Localhost)

```bash
k6 run --env BASE_URL="http://localhost:3000/api/v1/problem" tests/load/k6-load.js
```

### UAT

```bash
k6 run --env BASE_URL="http://uat-url/api/v1/problem" tests/load/k6-load.js
```

### Production

```bash
k6 run --env BASE_URL="http://prod-url/api/v1/problem" tests/load/k6-load.js
```

### Custom URL

```bash
k6 run --env BASE_URL="http://your-custom-url/api/v1/problem" tests/load/k6-load.js
```

---

## 📊 What Each Test Checks

All tests validate the following endpoints:

### 1. **GET /ping** (Health Check)

```bash
Request:  GET /ping
Response: 200 OK
Expected: Response time < 300ms
```

### 2. **GET /** (Get All Problems)

```bash
Request:  GET /
Response: 200 OK with array of problems
Expected: Response time < 500ms
```

### 3. **POST /** (Create Problem)

```bash
Request:  POST / with JSON body
         {
           "title": "Test Problem",
           "description": "Test description",
           "difficulty": "easy",
           "testCases": [{"input": "test", "output": "output"}]
         }
Response: 200/201 with created problem data
Expected: Response time < 600ms
```

---

## 📈 Understanding Results

When you run a test, you'll see results like:

```
✓ ping status 200
✓ ping response time < 300ms
✓ get all status 200
✓ create status 200/201
✓ create response time < 600ms

Thresholds: 1/1 passed
Requests: 150
Success Rate: 100%
Duration: 2m
```

### Key Metrics Explained

- **✓ Status Checks:** HTTP response codes are correct (200, 201, etc.)
- **✓ Response Time:** API responds faster than expected threshold
- **Success Rate:** Percentage of requests that succeeded (should be >99%)
- **Error Rate:** Percentage of failed requests (should be <1%)

---

## ✅ Success Criteria for Each Test

### Smoke Test - PASS Criteria ✅

- All endpoints return status 200
- Response time < 200ms
- Zero errors

### Load Test - PASS Criteria ✅

- Error rate < 1%
- p(95) response time < 500ms
- p(99) response time < 1000ms
- 10 concurrent users handled smoothly

### Ramp Test - PASS Criteria ✅

- System scales from 0 to 20 users
- Error rate stays < 2%
- No sudden performance drops

### Peak Test - PASS Criteria ✅

- System handles 50 concurrent users
- Error rate < 5% (may spike during increase)
- Recovers after stress

### Stress Test - PASS Criteria ✅

- Identifies system breaking point
- System doesn't crash below 100 VUs
- Recovers after stress removal

---

## 🕐 Recommended Testing Schedule

### Daily (5 minutes)

Run during working hours to monitor performance:

```bash
k6 run tests/load/k6-smoke.js
k6 run tests/load/k6-load.js
```

### Weekly (15 minutes)

Run every Monday to check scalability:

```bash
k6 run tests/load/k6-ramp.js
```

### Before Major Release (30 minutes)

Run all tests before deploying to production:

```bash
k6 run tests/load/k6-smoke.js
k6 run tests/load/k6-load.js
k6 run tests/load/k6-ramp.js
k6 run tests/load/k6-peak.js
```

### Optional - Stress Testing

Only run when investigating performance issues:

```bash
k6 run tests/load/k6-stress.js
```

---

## 🔧 Advanced Commands

### Run with custom VU count

```bash
k6 run --vus 20 --duration 5m tests/load/k6-load.js
```

### Export results to JSON file

```bash
k6 run --out json=results.json tests/load/k6-load.js
```

### Run with detailed output

```bash
k6 run -v tests/load/k6-load.js
```

### Run and save summary

```bash
k6 run tests/load/k6-load.js > test-results.txt 2>&1
```

---

## 🐛 Troubleshooting

### "Connection refused" Error

**Problem:** Test can't connect to API

```bash
# Check if API is running
curl http://localhost:3000/api/v1/problem/ping

# Verify correct URL
k6 run --env BASE_URL="http://your-actual-url/api/v1/problem" tests/load/k6-load.js
```

### High Error Rate (>1%)

**Problem:** Many requests failing

```bash
# Check API logs for errors
# Verify database is connected
# Monitor server resources (CPU, RAM, Disk)
# Try with fewer VUs:
k6 run --vus 5 tests/load/k6-load.js
```

### Timeout Errors

**Problem:** Requests taking too long

```bash
# Check network connectivity
# Check if API server is overloaded
# Monitor response times in API logs
```

---

## 📋 Test Files Structure

```
tests/load/
├── k6-smoke.js      # Smoke test (30s, 1 VU)
├── k6-load.js       # Load test (2m, 10 VUs)
├── k6-ramp.js       # Ramp test (4m, 0→20 VUs)
├── k6-peak.js       # Peak test (3.5m, 0→50 VUs)
├── k6-stress.js     # Stress test (6m, 0→100 VUs)
└── README.md        # This file
```

---

## 📚 Test Details

### Smoke Test (k6-smoke.js)

```javascript
Stages: 1 user for 30 seconds
Tests:
  - GET /ping
  - GET /
  - POST /
Purpose: Verify system is up and responding
```

### Load Test (k6-load.js)

```javascript
Stages: 10 users for 2 minutes (constant)
Tests:
  - GET /ping
  - GET /
  - POST /
Purpose: Measure performance under normal expected traffic
```

### Ramp Test (k6-ramp.js)

```javascript
Stages:
  - Ramp up: 0 to 20 users (1 minute)
  - Sustain: 20 users (2 minutes)
  - Ramp down: 20 to 0 users (1 minute)
Tests:
  - GET /ping
  - GET /
  - POST /
Purpose: Test system as traffic gradually increases
```

### Peak Test (k6-peak.js)

```javascript
Stages:
  - Quick ramp: 0 to 50 users (30 seconds)
  - Sustain: 50 users (2 minutes)
  - Ramp down: 50 to 0 users (1 minute)
Tests:
  - GET /ping
  - GET /
  - POST /
Purpose: Test system during sudden traffic spike
```

### Stress Test (k6-stress.js)

```javascript
Stages:
  - Ramp: 0 to 20 users (1 minute)
  - Ramp: 20 to 50 users (1 minute)
  - Ramp: 50 to 100 users (1 minute)
  - Sustain: 100 users (2 minutes)
  - Ramp down: 100 to 0 users (1 minute)
Tests:
  - GET /ping
  - GET /
  - POST /
Purpose: Find system breaking point
```

---

## 📖 How to Interpret Results

### Example Smoke Test Output

```
✓ ping status 200                    ✅ PASS
✓ ping response time < 300ms         ✅ PASS
✓ get all status 200                 ✅ PASS
✓ get all response time < 500ms      ✅ PASS
✓ create status 200/201              ✅ PASS
✓ create response time < 600ms       ✅ PASS

Running: 30s | 1 VU
Duration: 30s
Requests: 30
Success: 30 (100%)
Failed: 0
```

### Example Load Test Output

```
Running: 2m | 10 VUs
Duration: 2m
Requests: 300
Success: 297 (99%)
Failed: 3 (1%)

Aggregate Results:
http_reqs: 300
Success: 297
Errors: 3 (1%)

Response Times:
p(50): 150ms
p(95): 350ms  ← 95% of requests under 350ms
p(99): 450ms  ← 99% of requests under 450ms
```

---

## 💡 Performance Tips

1. **Run tests regularly** - Daily smoke + load tests
2. **Monitor trends** - Save results over time
3. **Test before releases** - Run all tests before deploying
4. **Check API logs** - See what errors are occurring
5. **Monitor server resources** - Watch CPU/RAM while testing
6. **Baseline metrics** - Know what "normal" performance looks like

---

## 🎓 K6 Resources

- [K6 Official Documentation](https://k6.io/docs/)
- [K6 HTTP Module](https://k6.io/docs/javascript-api/k6-http/)
- [K6 Check Function](https://k6.io/docs/javascript-api/k6/check/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing/)

---

## ✨ Summary

| Task                     | Command                          | Duration |
| ------------------------ | -------------------------------- | -------- |
| Check if system is up    | `k6 run tests/load/k6-smoke.js`  | 30s      |
| Daily performance check  | `k6 run tests/load/k6-load.js`   | 2m       |
| Weekly scalability check | `k6 run tests/load/k6-ramp.js`   | 4m       |
| Before major release     | `k6 run tests/load/k6-peak.js`   | 3.5m     |
| Find breaking point      | `k6 run tests/load/k6-stress.js` | 6m       |

**Start with Smoke Test** → **Run Load Test Daily** → **Run Peak before release**

---

**Last Updated:** December 28, 2025
**Service:** ExceHub Problem Service
**API Base URL:** `http://localhost:3000/api/v1/problem`

.\run-test.ps1 -Test peak

# Stress test

.\run-test.ps1 -Test stress

````

### Run with Custom URL

```powershell
# Using custom BaseUrl
.\run-test.ps1 -Test load -BaseUrl "http://your-api-url/api/v1/problem"

# Using environment preset
.\run-test.ps1 -Test load -Environment uat
````

---

## 📊 Test Scenarios Explained

### 1️⃣ Smoke Test (`k6-smoke.js`)

**Purpose:** Quick sanity check - Verify system is up

```
Duration: 30 seconds
VUs: 1 (single user)
Tests:
  - Ping endpoint
  - Get all problems
  - Create problem
```

**When to run:** Before other tests, quick health check

---

### 2️⃣ Load Test - Constant (`k6-load.js`)

**Purpose:** Test system under expected normal traffic ✅ MOST IMPORTANT

```
Duration: 2 minutes
VUs: 10 (constant)
Tests:
  - Ping endpoint
  - Get all problems
  - Create problem
```

**When to run:** Daily, to verify performance metrics

**Expected Metrics:**

- Response time < 500ms
- Error rate < 1%

---

### 3️⃣ Load Test - Ramp (`k6-ramp.js`)

**Purpose:** Test system as traffic gradually increases

```
Duration: 4 minutes total
  - Ramp up: 0 → 20 VUs (1 minute)
  - Sustain: 20 VUs (2 minutes)
  - Ramp down: 20 → 0 VUs (1 minute)
Tests:
  - Ping endpoint
  - Get all problems
  - Create problem
```

**When to run:** Weekly, to check scalability

**Scenario:** Working day morning traffic increase

---

### 4️⃣ Load Test - Peak (`k6-peak.js`)

**Purpose:** Test system during sudden traffic spike

```
Duration: 3.5 minutes total
  - Quick ramp: 0 → 50 VUs (30 seconds)
  - Sustain: 50 VUs (2 minutes)
  - Ramp down: 50 → 0 VUs (1 minute)
Tests:
  - Ping endpoint
  - Get all problems
  - Create problem
```

**When to run:** Before major launches/promotions

**Scenario:** Product launch, viral event, promotion spike

---

### 5️⃣ Stress Test (`k6-stress.js`)

**Purpose:** Find system breaking point (Optional)

```
Duration: 6 minutes total
  - Ramp: 0 → 20 VUs (1 minute)
  - Ramp: 20 → 50 VUs (1 minute)
  - Ramp: 50 → 100 VUs (1 minute)
  - Sustain: 100 VUs (2 minutes)
  - Ramp down: 100 → 0 VUs (1 minute)
Tests:
  - Ping endpoint
  - Get all problems
  - Create problem
```

**When to run:** Before high-traffic events (optional)

**Scenario:** Find absolute limits

---

## 🔧 Using K6 Directly

### Run single test without scripts

```bash
# Smoke test
k6 run --env BASE_URL="http://localhost:3000/api/v1/problem" tests/load/k6-smoke.js

# Load test
k6 run --env BASE_URL="http://localhost:3000/api/v1/problem" tests/load/k6-load.js

# Peak test
k6 run --env BASE_URL="http://localhost:3000/api/v1/problem" tests/load/k6-peak.js
```

### Custom scenarios

```bash
# Run with custom VU count
k6 run --vus 20 --duration 5m tests/load/k6-load.js

# Run with output to file
k6 run --out json=results.json tests/load/k6-load.js

# Run with thresholds
k6 run --thresholds="http_req_duration:p(95)<200" tests/load/k6-smoke.js
```

---

## 📈 Understanding Results

### Response Times

- **p(50)**: 50% of requests completed faster than this
- **p(95)**: 95% of requests completed faster than this (important!)
- **p(99)**: 99% of requests completed faster than this

### Metrics

- **Failed requests**: Requests with non-2xx status codes
- **Error rate**: Percentage of failed requests
- **Throughput**: Requests per second (RPS)

---

## 🎯 Performance Thresholds

### Acceptable Performance Metrics

| Metric              | Target   |
| ------------------- | -------- |
| p(95) Response Time | < 500ms  |
| p(99) Response Time | < 1000ms |
| Error Rate          | < 1%     |
| Success Rate        | > 99%    |

---

## 📝 Running Tests - Recommended Order

### Daily Testing (5 minutes)

```powershell
# Just smoke + constant load
.\run-test.ps1 -Test smoke
.\run-test.ps1 -Test load
```

### Weekly Testing (15 minutes)

```powershell
# All main tests
.\run-all-tests.ps1 -SkipStress
```

### Pre-Launch Testing (30 minutes)

```powershell
# All tests including stress
.\run-all-tests.ps1
```

---

## 🐛 Troubleshooting

### Test fails with connection error

```powershell
# Check if API is running
curl http://localhost:3000/api/v1/problem/ping

# Verify BASE_URL is correct
.\run-test.ps1 -Test smoke -BaseUrl "http://your-actual-url/api/v1/problem"
```

### High error rates

1. Check API logs for errors
2. Verify database connection
3. Check system resources (CPU, memory, disk)
4. Reduce VU count and rerun

### Timeout errors

1. Increase test duration
2. Verify network connectivity
3. Check API performance

---

## 📦 Environment Setup

### Prerequisites

- K6 installed: https://k6.io/docs/getting-started/installation/
- PowerShell 5.0+ or pwsh (cross-platform)
- API running and accessible

### Install K6

**Windows:**

```powershell
choco install k6
```

**macOS:**

```bash
brew install k6
```

**Linux:**

```bash
apt-get install k6
```

---

## 🔐 Environment Variables

### Development

```powershell
$env:BASE_URL = "http://localhost:3000/api/v1/problem"
```

### UAT

```powershell
$env:BASE_URL = "http://uat-url/api/v1/problem"
```

### Production

```powershell
$env:BASE_URL = "http://prod-url/api/v1/problem"
```

---

## 📊 Analyzing Results

### K6 Output

Results are displayed in terminal with:

- ✓/✗ Check results
- Response times (min, avg, max, p95, p99)
- Error counts
- Success rates

### Export Results

```bash
# JSON export
k6 run --out json=results.json tests/load/k6-load.js

# Summary display
k6 run tests/load/k6-load.js 2>&1 | tee results.txt
```

---

## 📚 Endpoints Tested

All tests validate these endpoints:

1. **GET /ping** - Health check
2. **GET /** - Get all problems
3. **POST /** - Create new problem

Each test also validates:

- ✅ Correct HTTP status code
- ✅ Response time within limits
- ✅ JSON response format
- ✅ Data structure integrity

---

## 🎓 Learning Resources

- [K6 Official Docs](https://k6.io/docs/)
- [K6 Best Practices](https://k6.io/docs/testing-guides/)
- [Load Testing Guide](https://k6.io/docs/test-types/load-test/)
- [Stress Testing Guide](https://k6.io/docs/test-types/stress-test/)

---

**Last Updated:** December 28, 2025
