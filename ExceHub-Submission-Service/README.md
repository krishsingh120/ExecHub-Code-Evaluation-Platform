# ExecHub Submission Service

A high-performance microservice for managing code submissions in a distributed online code execution platform. This service orchestrates the entire submission lifecycle, from initial validation through asynchronous evaluation and real-time client notification.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Flow](#architecture--flow)
- [Code Stub Pattern](#code-stub-pattern)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Setup](#environment-setup)
- [Running the Service](#running-the-service)
- [API Testing](#api-testing)
- [Monitoring & Observability](#monitoring--observability)
- [Scalability & Design Principles](#scalability--design-principles)
- [Contributing](#contributing)
- [Repository](#repository)

---

## Project Overview

**ExecHub Submission Service** is a core microservice in the ExecHub platform—an online judge system for code execution and evaluation. This service is responsible for:

- **Submission Management**: Create and persist code submissions to MongoDB
- **Asynchronous Processing**: Push submissions to Redis-based queues (BullMQ) for evaluation
- **Result Handling**: Consume evaluation results and update submission status
- **Real-time Notifications**: Communicate with WebSocket service to notify clients of execution status
- **Inter-service Communication**: Fetch problem metadata from Problem Admin Service via synchronous API calls

The service uses an event-driven architecture to decouple submission processing from evaluation, enabling horizontal scalability and fault tolerance.

---

## Architecture & Flow

### End-to-End Submission Lifecycle

The following diagram illustrates the complete flow of a code submission through the ExecHub platform:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ExecHub Submission Flow                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Client                Submission              Problem Admin         MongoDB
    │                     Service                  Service              │
    │                        │                         │                │
    ├─► Submit Code Request ─┤                         │                │
    │                        │                         │                │
    │                        ├─► Fetch Problem Info ──┤                │
    │                        │                         │                │
    │                        │◄─ Problem Details ─────┤                │
    │                        │ (Stubs, Tests, etc.)    │                │
    │                        │                         │                │
    │                        ├─ Create Submission ────────────────────┤
    │                        │                                         │
    │◄─ Submission Created ──┤                                         │
    │  (with ID)             │                                         │
    │                        │                                         │
    │                        ├─ Push to Redis Queue (BullMQ)
    │                        │
    │                        ▼
    │                   [Evaluator Service]
    │                   (Consumes Queue)
    │                   • Executes Code
    │                   • Runs Test Cases
    │                   • Generates Result
    │
    │                        ├─ Push Result to Result Queue
    │                        │
    │                        ├─ Consume Result from Queue
    │                        │
    │                        ├─ Update Submission Status in DB
    │                        │
    │                        ├─ Notify WebSocket Service
    │                        │
    │                        └─► [WebSocket Service]
    │                            (Real-time Updates)
    │
    │◄──────── Real-time Status Update via WebSocket ─────────────────┤
    │
    ▼
```

### Numbered Step-by-Step Flow

1. **Client Submission**: Client sends a code submission request to the Submission Service with function logic only
2. **Fetch Problem Details**: Submission Service makes a **synchronous API call** to Problem Admin Service to retrieve problem metadata
3. **Problem Query**: Problem Admin Service queries MongoDB to fetch problem definitions (constraints, test cases, code stubs)
4. **Return Problem Data**: Problem Admin Service returns problem details including start and end code snippets
5. **Create Submission Record**: Submission Service creates a submission entry in MongoDB with initial status
6. **Queue Submission**: Submission payload (with combined code) is pushed to Redis using BullMQ for asynchronous evaluation
7. **Immediate Client Response**: Client receives immediate confirmation that submission was created (non-blocking)
8. **Queue Consumption**: Evaluator Service consumes the submission from the Redis queue
9. **Code Evaluation**: Evaluator executes the combined code, runs test cases, and determines pass/fail status
10. **Push Results**: Evaluation result is pushed to another Redis queue for result processing
11. **Result Consumption**: Submission Service consumes the evaluation result from the result queue
12. **Update Status**: Submission Service updates the submission status in MongoDB (PASSED/FAILED/ERROR)
13. **WebSocket Notification**: Submission Service emits a notification event to WebSocket Service
14. **Client Notification**: WebSocket Service sends real-time execution status updates to the connected client

---

## Code Stub Pattern

ExecHub uses the **Code Stub Pattern** to standardize code execution across the platform:

### How It Works

- **Client Submission**: The client submits only the **function logic** or solution code snippet
- **Backend Assembly**: The Submission Service retrieves problem-defined code snippets and combines them as follows:
  ```
  Final Code = [Problem Start Snippet] + [User Code] + [Problem End Snippet]
  ```
- **Example**:

  ```javascript
  // Problem Start Snippet (from Problem Admin Service)
  function findMaxElement(arr) {
    // START_SOLUTION_MARKER

    // User Submitted Code
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) max = arr[i];
    }
    return max;

    // Problem End Snippet (from Problem Admin Service)
    // END_SOLUTION_MARKER
  }
  // Test runner code and assertions
  ```

### Benefits

- **Security**: Isolates user code and prevents direct access to test harnesses
- **Consistency**: Ensures all submissions are executed in a standardized environment
- **Flexibility**: Allows problems to define custom test runners, imports, and setup code
- **Maintainability**: Changes to test infrastructure don't require client updates

---

## Tech Stack

### Core Framework & Runtime

- **Node.js (CommonJS)**: JavaScript runtime for building scalable backend services

  - Chosen for: Fast I/O, event-driven architecture, large ecosystem
  - Supports: Asynchronous operations, streaming, microservices

- **Fastify**: Minimalist web framework optimized for performance
  - Provides: HTTP routing, middleware support, built-in request/response validation
  - Performance: Up to 3x faster than Express in benchmarks
  - Used for: Defining API endpoints, request handling, middleware composition

### Data Persistence

- **MongoDB**: Primary relational database for submission records

  - Stores: Submissions, user solutions, status history, metadata
  - Benefits: Flexible schema, horizontal scalability, rich query language

- **Azure Cosmos DB**: Distributed NoSQL database for error logs and telemetry
  - Stores: Service logs, evaluation errors, performance metrics, debugging information
  - Benefits: Global replication, SLA guarantees, time-series data optimization

### Message Queuing & Event Processing

- **Redis**: In-memory data store and message broker

  - Provides: Fast queue storage, Pub/Sub messaging, caching layer
  - Performance: Sub-millisecond latency for queue operations

- **BullMQ**: Enterprise-grade queue library built on Redis

  - Features: Job scheduling, retry logic, dead-letter queues, rate limiting
  - Reliable: Ensures no job loss, supports recovery from service failures

- **Bull Board UI**: Web-based dashboard for queue monitoring and management
  - Provides: Visual queue status, job inspection, manual job reprocessing, metrics
  - Used for: Debugging, monitoring, operational management

### Inter-Service Communication

- **Axios**: Promise-based HTTP client for service-to-service calls
  - Features: Request/response interceptors, timeout handling, automatic retries
  - Used for: Fetching problem details from Problem Admin Service
  - Configuration: Global instance with baseURL and headers in `config/axiosInstance.js`

### Real-time Communication

- **WebSockets**: Bi-directional communication protocol
  - Enables: Real-time status updates to connected clients
  - Flow: Submission Service → WebSocket Service → Client browsers

---

## Folder Structure

```
src/
├── apis/                          # External service API integrations
│   └── ProblemServiceApi.js       # Problem Admin Service API wrapper
│
├── config/                        # Configuration and initialization
│   ├── axiosInstance.js           # Configured HTTP client for inter-service calls
│   ├── bullBoardConfig.js         # Bull Board dashboard configuration
│   ├── dbConfig.js                # MongoDB connection setup
│   ├── redisConfig.js             # Redis client initialization
│   └── serverConfig.js            # Fastify server configuration
│
├── controllers/                   # Request handlers (HTTP layer)
│   └── submissionController.js    # Submission API endpoint handlers
│
├── models/                        # Database schemas and ORM definitions
│   └── submissionModel.js         # MongoDB submission schema and validations
│
├── producers/                     # Queue message publishers
│   └── submissionQueueProducer.js # Publishes submissions to Redis queue
│
├── queues/                        # Queue definitions and setup
│   └── SubmissionQueue.js         # BullMQ queue configuration and job setup
│
├── repositories/                  # Data access layer (Database abstraction)
│   ├── repositoryPlugin.js        # Repository pattern initialization and DI
│   └── submissionRepository.js    # Database operations for submissions (CRUD)
│
├── routes/                        # API routing definitions
│   ├── index.js                   # Route registration entry point
│   └── api/
│       ├── apiRoutes.js           # Main API route aggregator
│       └── v1/
│           ├── SubmissionRoutes.js # Version 1 submission endpoints
│           └── v1Routes.js        # V1 API route setup
│
├── services/                      # Business logic layer
│   ├── servicePlugin.js           # Service layer initialization and DI
│   └── submissionService.js       # Core submission processing logic
│
├── workers/                       # Queue job processors
│   └── evaluationWorker.js        # Consumes and processes evaluation results
│
├── app.js                         # Application instance factory
└── index.js                       # Server initialization and startup
```

### Architectural Layers

1. **Controllers**: HTTP request handlers; validate input, call services
2. **Services**: Business logic; orchestrate repositories and external APIs
3. **Repositories**: Data access abstraction; database operations
4. **Models**: Data validation and schema definitions
5. **Producers/Workers**: Queue message publishers and consumers
6. **APIs**: External service integrations

---

## Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
APP_NAME=ExecHub-Submission-Service
LOG_LEVEL=info

# Database Configuration
ATLAS_DB_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_DB_NAME=submissions_db

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# External Service URLs
PROBLEM_ADMIN_SERVICE_URL=http://localhost:3000
EVALUATOR_SERVICE_URL=http://localhost:8000
WEBSOCKET_SERVICE_URL=http://localhost:4000

# Queue Configuration
SUBMISSION_QUEUE_NAME=submissions
EVALUATION_RESULT_QUEUE_NAME=evaluation-results
SUBMISSION_QUEUE_PREFIX=exechub

# Queue Processing
MAX_RETRY_ATTEMPTS=3
JOB_TIMEOUT=30000
BACKOFF_DELAY=5000
WORKERS_CONCURRENCY=5

# Bull Board Configuration
BULL_BOARD_ENABLED=true
BULL_BOARD_PORT=3010


# Cosmos DB / Azure Logging
COSMOS_DB_ENABLED=false
COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_DB_KEY=your_cosmos_db_primary_key
COSMOS_DB_DATABASE=exechub-logs
COSMOS_DB_CONTAINER=logs

# API Configuration
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=2

# Logging
LOG_REQUESTS=true
LOG_RESPONSES=false
CORRELATION_ID_HEADER=x-correlation-id

```

### Environment Notes

- **Development**: Use local MongoDB and Redis instances
- **Production**: Use cloud-managed services (Azure Database for MongoDB, Azure Cache for Redis)
- **Secrets**: Never commit `.env` file; use CI/CD secrets management
- **Validation**: The application validates critical environment variables on startup

---

## Running the Service

### Prerequisites

- Node.js v16 or higher
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Start the Service

```bash
# Development mode (with nodemon for auto-restart)
npm start && npx nodemon src/index.js

# Production mode
NODE_ENV=production npm start


# Check API health
curl http://localhost:3002/health

# Access Bull Board dashboard
# Open browser: http://localhost:3010
# Default credentials: admin / secure_password
```

### Common Startup Issues

| Issue                     | Solution                                               |
| ------------------------- | ------------------------------------------------------ |
| `ECONNREFUSED` on MongoDB | Ensure MongoDB is running and URI is correct in `.env` |
| `REDIS connection failed` | Verify Redis is running on `REDIS_HOST:REDIS_PORT`     |
| `Port already in use`     | Change `PORT` in `.env` or kill existing process       |
| `Module not found`        | Run `npm install` to fetch dependencies                |

---

## API Testing

### Testing Tools

#### **Postman**

- Collection-based API testing
- Environment variable support for different stages
- Built-in CI/CD integration
- **Usage**: Import collection, set environment, run requests

#### **REST Client (VS Code Extension)**

- Lightweight in-editor API testing
- `.rest` or `.http` file format
- No external tool required
- **File Location**: `tests/apis/apis.rest`

#### **k6 Load Testing**

- Open-source load and performance testing tool
- JavaScript-based test scripts
- Real-time metrics and insights
- **File Location**: `tests/load/k6-load.js`
- **Run Tests**:
  ```bash
  k6 run tests/load/k6-load.js
  ```

### Sample API Endpoints

```bash
# Create a new submission
POST /api/v1/submissions
Content-Type: application/json

{
  "userId": "user123",
  "problemId": "problem456",
  "language": "javascript",
  "code": "let max = arr[0]; for (let i = 1; i < arr.length; i++) { if (arr[i] > max) max = arr[i]; } return max;"
}

# Get submission status
GET /api/v1/submissions/:submissionId

# List user submissions
GET /api/v1/submissions?userId=user123&limit=10

# Webhook: Receive evaluation result
POST /api/v1/webhooks/evaluation-result
Content-Type: application/json

{
  "submissionId": "sub789",
  "status": "PASSED",
  "executionTime": 125,
  "memoryUsed": 2048,
  "testResults": [...]
}
```

---

## Monitoring & Observability

### Bull Board UI

**Purpose**: Monitor queue health and job processing in real-time

**Access**: `http://localhost:3010` (after starting the service)

**Features**:

- **Queue Status**: View active, completed, failed, and pending jobs
- **Job Inspection**: Examine job data, logs, and execution history
- **Manual Intervention**: Reprocess failed jobs, pause/resume queues
- **Metrics**: Track throughput, error rates, average processing time

**Configuration**: Defined in `config/bullBoardConfig.js`

### Logging Strategy

#### **MongoDB Logging**

- Application logs, API access logs
- Indexed for quick searching and filtering
- Retention: 30 days (configurable)

#### **Azure Cosmos DB Telemetry**

- Error logs with stack traces
- Performance metrics (response times, queue delays)
- Service-to-service call logs
- Query performance data

#### **Structured Logging**

```javascript
// Example log format
{
  timestamp: "2025-01-05T10:30:45.123Z",
  level: "error",
  service: "submission-service",
  correlationId: "req-123-abc",
  userId: "user123",
  message: "Failed to fetch problem details",
  error: "timeout",
  metadata: { problemId: "prob456", retries: 2 }
}
```

### Monitoring Alerts

Set up alerts for:

- Queue processing time exceeds threshold (SLA: < 2 seconds)
- Failed job rate > 5%
- Service response time > 500ms
- Redis memory usage > 80%
- MongoDB connection pool exhausted

---

## Scalability & Design Principles

### Asynchronous Architecture

**Problem**: Synchronous submission processing creates bottlenecks

- Evaluation can take 5-30+ seconds per submission
- Client waits for full completion before response
- High latency degrades user experience

**Solution**: Event-driven asynchronous processing

- Submission created immediately (< 100ms)
- Evaluation happens in background queue
- Client notified via WebSocket when ready

**Benefits**:

- Responsive user interface
- Decoupled components
- Better resource utilization
- Horizontal scalability

### Loose Coupling

**Service Dependencies**:

- **Synchronous**: Submission Service → Problem Admin Service (required)
- **Asynchronous**: Submission Service ↔ Evaluator Service (via Redis queue)
- **Event-based**: Submission Service → WebSocket Service (notification)

**Decoupling Benefits**:

- Evaluator Service can be scaled independently
- Problem Admin Service outages don't crash Submission Service
- Services can be deployed separately
- Technology stack changes isolated to single service

### Horizontal Scalability

**Via Redis Queues**:

- Multiple Submission Service instances can consume from same queue
- Multiple Evaluator Service instances can process jobs concurrently
- Load automatically distributed by BullMQ

**Considerations**:

- Ensure MongoDB and Redis are clustered
- Use connection pooling for database connections
- Implement request-level tracing (correlation IDs)
- Monitor queue depth and processing latency

### Fault Tolerance

**Queue Reliability**:

- BullMQ provides guaranteed job delivery (no loss on crashes)
- Automatic retry on failure (configurable attempts)
- Dead-letter queue for permanently failed jobs

**Service Resilience**:

- Timeout handling on API calls to Problem Admin Service
- Circuit breaker pattern for cascading failure prevention
- Graceful degradation if WebSocket Service unavailable

### Key Design Patterns

| Pattern                  | Implementation                                |
| ------------------------ | --------------------------------------------- |
| **Repository Pattern**   | Data access abstraction in `repositories/`    |
| **Dependency Injection** | Service/repository plugins for loose coupling |
| **Producer-Consumer**    | Submission queue and result queue processing  |
| **Circuit Breaker**      | Axios interceptors for external API calls     |
| **Code Stub**            | Dynamic code assembly from problem metadata   |

---

## Performance Considerations

- **Database Indexing**: Submissions indexed by userId, status, createdAt for fast queries
- **Connection Pooling**: MongoDB and Redis connections reused, not recreated per request
- **Caching**: Problem details cached in memory to reduce API calls
- **Queue Batching**: Multiple submissions processed in parallel by workers
- **Compression**: API responses compressed using gzip (Fastify default)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request with detailed description

**Code Standards**:

- Follow CommonJS module syntax
- Use async/await for asynchronous operations
- Add JSDoc comments for public methods
- Write tests for new features
- Run `npm test` before submitting PR

---

## Repository

**GitHub**: [ExceHub-Submission-Service](https://github.com/krishsingh120/ExceHub-Submission-Service.git)

**Clone Repository**:

```bash
git clone https://github.com/krishsingh120/ExceHub-Submission-Service.git
cd ExceHub-Submission-Service
npm install
```

---

## License

This project is part of the ExecHub platform. For licensing information, please refer to the main repository.

---

## Support & Contact

For questions or issues:

- Open an issue on GitHub
- Contact the backend team
- Refer to project documentation and architecture decisions

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production-Ready
