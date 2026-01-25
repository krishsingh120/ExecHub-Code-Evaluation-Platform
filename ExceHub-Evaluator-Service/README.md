# ExecHub-Evaluator-Service

A high-performance, containerized code execution and evaluation microservice for a distributed online coding platform. This service securely executes user-submitted code, evaluates it against test cases, and publishes evaluation results asynchronously across the platform.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Execution Flow](#architecture--execution-flow)
- [Docker-based Code Execution](#docker-based-code-execution)
- [Streaming Execution Logs](#streaming-execution-logs)
- [Language Execution Strategy](#language-execution-strategy)
- [Folder Structure](#folder-structure)
- [Tech Stack](#tech-stack)
- [Error Handling & Limits](#error-handling--limits)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [TypeScript Setup](#typescript-setup)
- [Testing](#testing)
- [Monitoring & Observability](#monitoring--observability)
- [Scalability & Design Principles](#scalability--design-principles)

---

## Project Overview

**ExecHub-Evaluator-Service** is a core component of the ExecHub online code execution platform. It operates as an event-driven microservice that consumes code submission jobs from a distributed queue, executes them in isolated containers, and publishes results back asynchronously.

### Key Responsibilities

- **Queue Consumption**: Consumes submission jobs from Redis (BullMQ)
- **Secure Execution**: Executes code inside isolated Docker containers with resource constraints
- **Multi-Language Support**: Supports C++, Java, Python, and JavaScript out of the box
- **Stream Processing**: Leverages Node.js Streams to process execution logs chunk-by-chunk
- **Comprehensive Evaluation**: Detects runtime errors, TLE (Time Limit Exceeded), MLE (Memory Limit Exceeded), and compilation failures
- **Asynchronous Publishing**: Publishes evaluation results back to Redis for consumption by the Submission Service
- **Observability**: Persists structured logs to MongoDB (Winston) and error logs to Azure Cosmos DB
- **Queue Monitoring**: Exposes Bull Board UI for real-time queue and job monitoring

---

## Architecture & Execution Flow

### Complete Evaluation Lifecycle

The evaluation pipeline follows a well-defined, multi-stage execution flow:

```
┌─────────────────────┐
│  Submission Service │ (Pushes job)
└──────────┬──────────┘
           │
           ▼
      ┌────────────────────────────────┐
      │   Redis Queue (BullMQ)         │
      │  submission-queue              │
      └────────┬─────────────────────┘
               │
               ▼
     ┌──────────────────────────────┐
     │ Evaluator Service            │ (Consumes job)
     │ 1. Pull Docker Image         │
     │ 2. Create Container          │
     │ 3. Execute Code              │
     │ 4. Stream Logs               │
     │ 5. Match Test Cases          │
     │ 6. Detect TLE/MLE/RE         │
     └────────┬──────────────────────┘
              │
              ▼
      ┌────────────────────────┐
      │ Redis Queue (BullMQ)   │
      │  evaluation-queue      │
      └────────┬───────────────┘
               │
               ▼
      ┌──────────────────────┐
      │ Submission Service   │ (Publishes result)
      │ Updates Database     │
      └──────────────────────┘
```

### Step-by-Step Execution Process

1. **Job Submission**: The Submission Service pushes a submission payload to the `submission-queue` in Redis.

2. **Job Consumption**: The Evaluator Service's worker consumes the job from the submission queue.

3. **Job Payload Structure**:

    ```typescript
    {
      language: "cpp" | "java" | "python" | "javascript"
      code: string                    // Combined: start + user + end snippet
      testCases: TestCase[]           // Input/output pairs
      timeLimit: number               // Milliseconds
      memoryLimit: number             // Megabytes
      submissionId: string            // For traceability
    }
    ```

4. **Image Pull**: Evaluator pulls the required Docker image (language-specific) if not already available locally.

5. **Container Creation**: A Docker container is dynamically created using Dockerode with resource constraints applied.

6. **Code Execution**: Code executes inside the container via shell/cmd scripts, isolated from the host system.

7. **Log Streaming**: Execution logs (stdout/stderr) are streamed using Node.js Streams instead of buffering entire output.

8. **Chunk-by-Chunk Processing**: Logs arrive as Buffers with metadata:
    - Stream type (stdout or stderr)
    - Length header (protocol)
    - Value bytes

9. **Test Case Matching**: Output is matched against expected test cases incrementally.

10. **Constraint Detection**:
    - **TLE**: If execution exceeds the time limit
    - **MLE**: If memory usage exceeds the limit
    - **RE**: Runtime errors during execution
    - **CE**: Compilation errors during build phase

11. **Status Generation**: Final evaluation status is determined:
    - **AC** (Accepted): All test cases pass
    - **WA** (Wrong Answer): Output mismatch
    - **TLE** (Time Limit Exceeded): Execution timeout
    - **MLE** (Memory Limit Exceeded): Memory overflow
    - **RE** (Runtime Error): Exception during execution
    - **CE** (Compilation Error): Failed to build

12. **Result Publishing**: Evaluation result is pushed to the `evaluation-queue` in Redis.

13. **Service Consumption**: Submission Service consumes the result and updates the database.

14. **Persistence**: Logs and errors are persisted for observability and debugging.

---

## Docker-based Code Execution

### Container Management with Dockerode

ExecHub-Evaluator-Service uses **Dockerode**, a Node.js Docker API client, to programmatically manage containers. This approach provides:

- **Dynamic Container Lifecycle**: Create, execute, and destroy containers on-demand
- **Resource Constraints**: Apply CPU and memory limits during execution
- **Isolation**: Each execution runs in a sandboxed environment
- **Language Abstraction**: Support multiple languages without installing them on the host

### Supported Language Images

The service pulls language-specific Docker images:

| Language   | Image        | Executor Class       |
| ---------- | ------------ | -------------------- |
| C++        | `gcc:latest` | `CppExecutor`        |
| Java       | `openjdk:11` | `JavaExecutor`       |
| Python     | `python:3.9` | `PythonExecutor`     |
| JavaScript | `node:18`    | `JavaScriptExecutor` |

### Container Lifecycle

```
┌──────────────────────────────────────────────────┐
│ Container Creation Phase                         │
├──────────────────────────────────────────────────┤
│ 1. Pull image (if not cached)                   │
│ 2. Create container with resource limits         │
│ 3. Mount code files (read-only)                  │
│ 4. Set environment variables                     │
└──────────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│ Execution Phase                                  │
├──────────────────────────────────────────────────┤
│ 1. Execute build script (compile if needed)      │
│ 2. Execute run script (execute user code)        │
│ 3. Stream stdout/stderr in real-time             │
│ 4. Monitor memory and CPU usage                  │
└──────────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│ Cleanup Phase                                    │
├──────────────────────────────────────────────────┤
│ 1. Stop container (graceful shutdown)            │
│ 2. Remove container (free resources)             │
│ 3. Log execution results                         │
│ 4. Handle cleanup on failure                     │
└──────────────────────────────────────────────────┘
```

### Security & Isolation Benefits

- **Process Isolation**: Code runs in a separate Linux namespace
- **Filesystem Isolation**: Restricted view of the host filesystem
- **Network Isolation**: No network access by default (optional)
- **Resource Limits**: CPU and memory are strictly bounded
- **Read-Only Code**: Source files are mounted as read-only
- **Automatic Cleanup**: Containers are destroyed after execution

---

## Streaming Execution Logs

### Why Node.js Streams?

Instead of buffering entire execution output (which can consume significant memory), the Evaluator Service uses **Node.js Streams** for memory-efficient, real-time log processing:

- **Chunk-by-Chunk Reading**: Data arrives as Buffers in small chunks
- **Low Memory Footprint**: Processes chunks incrementally without storing the full output
- **Real-Time Processing**: Enables early termination on errors or pattern detection
- **Scalability**: Supports long-running executions with minimal overhead

### Docker Stream Protocol

Docker streams execution output using a custom protocol. Each chunk contains:

```
┌────────────────────────────────────────────┐
│ Byte 0: Stream Type                        │
│   1 = stdout                               │
│   2 = stderr                               │
├────────────────────────────────────────────┤
│ Bytes 1-4: Payload Length (Big-Endian)    │
├────────────────────────────────────────────┤
│ Bytes 5 - 5+Length: Actual Data (UTF-8)   │
└────────────────────────────────────────────┘
```

### Processing Pipeline

```typescript
// Pseudo-code for stream processing
container.attach({ stream: true, stdout: true, stderr: true }).then((stream) => {
    stream.on("data", (chunk: Buffer) => {
        // Parse Docker protocol header
        const streamType = chunk[0]; // 1 = stdout, 2 = stderr
        const length = chunk.readUInt32BE(1);
        const data = chunk.subarray(8, 8 + length).toString("utf-8");

        // Process incrementally
        processLogChunk(data, streamType);

        // Check for early termination
        if (shouldTerminate(data)) {
            stream.destroy();
            return;
        }
    });
});
```

### Benefits in Practice

- **Memory Efficiency**: A 100MB log is never fully loaded into memory
- **Early Detection**: Detect infinite loops or crashes immediately
- **Real-Time Monitoring**: Logs are available as they're generated
- **Graceful Degradation**: Handle partial outputs gracefully

---

## Language Execution Strategy

### Design Patterns: Strategy + Factory

The Evaluator Service employs two complementary design patterns for clean, extensible language support:

#### Factory Pattern

The **ExecutorFactory** creates language-specific executors dynamically based on the language specified in the submission:

```typescript
// ExecutorFactory.ts
class ExecutorFactory {
    static createExecutor(language: string): CodeExecutorStrategy {
        switch (language.toLowerCase()) {
            case "cpp":
                return new CppExecutor();
            case "java":
                return new JavaExecutor();
            case "python":
                return new PythonExecutor();
            case "javascript":
                return new JavaScriptExecutor();
            default:
                throw new UnsupportedLanguageError(language);
        }
    }
}
```

#### Strategy Pattern

Each executor implements the **CodeExecutorStrategy** interface, defining language-specific behavior:

```typescript
// codeExecutorStrategy.ts
interface CodeExecutorStrategy {
    compileCommand(): string; // Compile command (if needed)
    runCommand(): string; // Run command
    getTimeoutMs(): number; // Timeout in milliseconds
    getMemoryLimitMb(): number; // Memory limit in MB
    isCompilationRequired(): boolean; // Does this language require compilation?
}
```

### Language-Specific Executors

**C++ Executor** (`CppExecutor`)

- **Compiled Language**: Requires compilation before execution
- **Compile Command**: `g++ -o output main.cpp`
- **Run Command**: `./output`
- **Typical Constraints**: 5s timeout, 256MB memory

**Java Executor** (`JavaExecutor`)

- **Compiled Language**: Requires compilation
- **Compile Command**: `javac Main.java`
- **Run Command**: `java Main`
- **Typical Constraints**: 10s timeout, 512MB memory

**Python Executor** (`PythonExecutor`)

- **Interpreted Language**: No compilation needed
- **Run Command**: `python3 main.py`
- **Typical Constraints**: 5s timeout, 128MB memory

**JavaScript Executor** (`JavaScriptExecutor`)

- **Interpreted Language**: No compilation needed
- **Run Command**: `node main.js`
- **Typical Constraints**: 5s timeout, 256MB memory

### Adding a New Language

To support a new language (e.g., Go):

1. Create `GoExecutor` implementing `CodeExecutorStrategy`
2. Add case to `ExecutorFactory.createExecutor()`
3. Add Docker image to container configuration
4. Update environment variables and documentation

This design ensures **Open/Closed Principle**: open for extension, closed for modification.

---

## Folder Structure

```
src/
├── index.ts                          # Application entry point
├── config/
│   ├── server.config.ts              # Express server configuration
│   ├── redis.config.ts               # Redis connection setup
│   └── bullboard.config.ts           # Bull Board UI configuration
├── containers/
│   ├── containerFactory.ts           # Factory for Docker containers
│   ├── dockerHelper.ts               # Docker API utilities
│   ├── pullImage.ts                  # Image pulling logic
│   ├── cppExecutor.ts                # C++ execution strategy
│   ├── javaExecutor.ts               # Java execution strategy
│   ├── pythonExecutor.ts             # Python execution strategy
│   └── (others)                      # Additional language executors
├── controllers/
│   ├── pingController.ts             # Health check endpoint
│   └── submissionController.ts       # Submission API handler
├── dtos/
│   └── createSubmissionDtos.ts       # Data transfer object definitions
├── jobs/
│   ├── SubmissionJob.ts              # Submission job definition
│   └── SampleJob.ts                  # Sample/test job
├── producers/
│   ├── submissionQueueProducer.ts    # Push jobs to submission queue
│   ├── evaluationQueueProducer.ts    # Push results to evaluation queue
│   └── sampleQueueProducer.ts        # Sample queue producer
├── queues/
│   ├── submissionQueue.ts            # BullMQ submission queue setup
│   ├── evaluationQueue.ts            # BullMQ evaluation queue setup
│   └── sampleQueue.ts                # BullMQ sample queue setup
├── routes/
│   ├── index.ts                      # Route aggregation
│   └── v1/
│       ├── index.ts                  # V1 route aggregation
│       ├── pingRouter.ts             # Health check routes
│       └── submissionRoutes.ts       # Submission routes
├── types/
│   ├── bullMqJobDefinition.ts        # BullMQ job types
│   ├── bullMqWorkerResponse.ts       # BullMQ worker response types
│   ├── codeExecutorStrategy.ts       # Executor interface
│   ├── dockerStreamOutput.ts         # Docker stream protocol types
│   ├── submissionPayload.ts          # Submission data structure
│   └── testCases.ts                  # Test case types
├── utils/
│   ├── constants.ts                  # Application constants
│   ├── codeCreator.ts                # Code file generation utilities
│   └── ExecutorFactory.ts            # Language executor factory
├── validators/
│   └── zodValidator.ts               # Zod schema definitions
└── workers/
    ├── SubmissionWorker.ts           # Queue consumer for submissions
    └── SampleWorker.ts               # Sample worker implementation
```

### Folder Responsibilities

| Folder          | Responsibility                                                    |
| --------------- | ----------------------------------------------------------------- |
| **config**      | Centralized configuration for server, Redis, and monitoring tools |
| **containers**  | Docker lifecycle management and language-specific executors       |
| **controllers** | HTTP request handlers and API logic                               |
| **dtos**        | Strongly-typed data transfer objects for API contracts            |
| **jobs**        | Job payload definitions for queue processing                      |
| **producers**   | Publishing evaluation results to Redis queues                     |
| **queues**      | BullMQ queue initialization and configuration                     |
| **routes**      | HTTP route definitions and versioning                             |
| **types**       | Shared TypeScript interfaces and type definitions                 |
| **utils**       | Reusable utility functions and factories                          |
| **validators**  | Input validation schemas using Zod                                |
| **workers**     | Queue consumers (workers) that process jobs asynchronously        |

---

## Tech Stack

### Core Runtime & Framework

- **Node.js**: High-performance, event-driven JavaScript runtime
- **TypeScript**: Static typing for safer, maintainable code
- **Express.js**: Lightweight, flexible HTTP server framework

### Queue & Event Management

- **Redis**: In-memory data store for distributed queues
- **BullMQ**: Enterprise-grade job queue library built on Redis
    - Producer-consumer pattern for asynchronous job processing
    - Job retry logic, delayed jobs, and job priorities
    - Atomic operations for reliable message delivery

### Container Management

- **Docker**: Containerization platform for isolated code execution
- **Dockerode**: Node.js Docker API client
    - Programmatic container lifecycle management
    - Stream handling for log processing
    - Image pulling and caching

### Stream Processing

- **Node.js Streams API**: Memory-efficient chunk-based data processing
    - Reading logs incrementally without buffering entire output
    - Real-time stdout/stderr handling
    - Backpressure support for handling slow consumers

### Data Persistence & Logging

- **MongoDB**: Document database for structured application logs
- **Winston**: Structured logging library
    - JSON log formatting
    - Log levels and filtering
    - Transport system for multiple destinations
- **Azure Cosmos DB**: NoSQL database for error logs and trace data
    - Global distribution and redundancy
    - Strong consistency guarantees

### Data Validation

- **Zod**: TypeScript-first schema validation library
    - Runtime validation of API inputs
    - Type-safe error messages
    - Automatic type inference from schemas

### Monitoring & Observability

- **Bull Board**: Web UI for BullMQ queue visualization
    - Real-time job monitoring
    - Queue statistics and metrics
    - Failed job inspection and retry management

### Development Tools

- **TypeScript Compiler (tsc)**: Transpile TypeScript to JavaScript
- **Nodemon**: Automatic server restart on file changes
- **ts-node**: Execute TypeScript directly without compilation step

---

## Error Handling & Limits

### Execution Error Types

The Evaluator Service detects and classifies various failure scenarios:

#### Compilation Errors (CE)

Occurs when code fails to compile before execution:

```typescript
{
  status: 'CE',
  message: 'Compilation failed',
  error: 'error: no member named "foo" in "class Bar"',
  language: 'cpp'
}
```

**Handled by**: Language executors during compile phase

#### Runtime Errors (RE)

Exceptions thrown during execution (segmentation faults, uncaught exceptions, etc.):

```typescript
{
  status: 'RE',
  message: 'Runtime error during execution',
  error: 'Segmentation fault (core dumped)',
  language: 'cpp'
}
```

**Handled by**: Stream processing detects error output

#### Time Limit Exceeded (TLE)

Execution exceeds the specified time limit (infinite loops, inefficient algorithms):

```typescript
{
  status: 'TLE',
  message: 'Execution time exceeded limit',
  timeLimit: 5000,        // milliseconds
  actualTime: 6500
}
```

**Handled by**: Container timeout mechanism or watchdog timer

#### Memory Limit Exceeded (MLE)

Process exceeds the memory limit allocation:

```typescript
{
  status: 'MLE',
  message: 'Memory limit exceeded',
  memoryLimit: 256,       // MB
  actualMemory: 512
}
```

**Handled by**: Docker memory constraints and cgroup monitoring

#### Wrong Answer (WA)

Output doesn't match expected test case output:

```typescript
{
  status: 'WA',
  message: 'Output mismatch on test case 3',
  expected: '42',
  actual: '41',
  testCaseIndex: 2
}
```

**Handled by**: Output matching logic in submission worker

### Error Handling Strategy

```typescript
// Graceful container cleanup on failure
async executeSubmission(submission: SubmissionPayload) {
  let container;
  try {
    container = await createContainer(submission);
    const result = await executeInContainer(container, submission);
    return result;
  } catch (error) {
    // Log error with full context
    logger.error('Execution failed', {
      submissionId: submission.id,
      error: error.message,
      stack: error.stack
    });

    // Publish error result
    await publishEvaluationResult({
      submissionId: submission.id,
      status: classifyError(error),
      error: error.message
    });
  } finally {
    // Always cleanup container, even on failure
    if (container) {
      await container.stop().catch(() => {});
      await container.remove().catch(() => {});
    }
  }
}
```

### Limits and Constraints

Default execution limits (configurable per submission):

| Constraint   | Default | Unit    | Rationale                             |
| ------------ | ------- | ------- | ------------------------------------- |
| Time Limit   | 5       | seconds | Prevent infinite loops                |
| Memory Limit | 256     | MB      | Fair resource allocation              |
| Output Size  | 10      | MB      | Prevent memory exhaustion from output |
| Input Size   | 1       | MB      | Reasonable max input size             |

---

## Environment Variables

### Configuration

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=8000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Docker Configuration
DOCKER_SOCKET=/var/run/docker.sock
DOCKER_REGISTRY_URL=

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/exechub-logs
COSMOS_DB_CONNECTION_STRING=DefaultEndpointsProtocol=https;...

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Bull Board Configuration
BULLBOARD_PASSWORD=your_secure_password
BULLBOARD_PORT=3001

# Service Configuration
MAX_CONCURRENT_EXECUTIONS=10
CONTAINER_CLEANUP_INTERVAL=3600000  # 1 hour in milliseconds
QUEUE_PROCESS_CONCURRENCY=5
```

### Environment Variable Reference

| Variable                      | Default              | Description                                 |
| ----------------------------- | -------------------- | ------------------------------------------- |
| `PORT`                        | 8000                 | HTTP server port                            |
| `NODE_ENV`                    | development          | Environment (development, production, test) |
| `REDIS_HOST`                  | 127.0.0.1            | Redis server hostname                       |
| `REDIS_PORT`                  | 6379                 | Redis server port                           |
| `REDIS_PASSWORD`              | (empty)              | Redis authentication password               |
| `REDIS_DB`                    | 0                    | Redis database number                       |
| `DOCKER_SOCKET`               | /var/run/docker.sock | Docker daemon socket path                   |
| `MONGODB_URI`                 | -                    | MongoDB connection string                   |
| `COSMOS_DB_CONNECTION_STRING` | -                    | Azure Cosmos DB connection string           |
| `LOG_LEVEL`                   | info                 | Winston log level                           |
| `BULLBOARD_PASSWORD`          | -                    | Bull Board dashboard password               |
| `BULLBOARD_PORT`              | 3001                 | Bull Board UI port                          |
| `MAX_CONCURRENT_EXECUTIONS`   | 10                   | Max parallel container executions           |
| `QUEUE_PROCESS_CONCURRENCY`   | 5                    | Worker concurrency per queue                |

---

## Running the Service

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Docker** (for code execution)
- **Redis** (for queue management)
- **MongoDB** (optional, for structured logging)
- **Azure Cosmos DB** (optional, for error logs)

### Installation

```bash
# Clone the repository
git clone https://github.com/krishsingh120/ExceHub-Evaluator-Service.git
cd ExecHub-Evaluator-Service

# Install dependencies
npm install
```

### Development Mode

```bash
# Recommended: Run TypeScript compiler in watch mode + server with nodemon
npm run dev

# If npm run dev doesn't work, manually start both:
# Terminal 1: Watch TypeScript compilation
npx tsc -w

# Terminal 2: Run server with auto-restart
npx nodemon dist/index.js
```

### Production Mode

```bash
# Compile TypeScript
npm run build

# Start server
npm start

# Or use a process manager (recommended)
npm install -g pm2
pm2 start dist/index.js --name "evaluator-service"
pm2 save
pm2 startup
```

### Verify Service Health

```bash
# Check server responsiveness
curl http://localhost:8000/api/v1/ping

# Access Bull Board UI (queue monitoring)
open http://localhost:3001
```

### Logs and Debugging

```bash
# View logs (development)
npm run dev 2>&1 | grep -i error

# View logs from file
tail -f logs/evaluator-service.log

# Filter logs by level
grep '"level":"error"' logs/evaluator-service.log | jq
```

---

## TypeScript Setup

### Configuration Overview

The service uses **TypeScript** for static typing, better IDE support, and compile-time error detection. Configuration is managed via `tsconfig.json`.

### Key tsconfig Settings

```json
{
    "compilerOptions": {
        "target": "ES2020", // Compile to modern JavaScript
        "module": "commonjs", // CommonJS for Node.js
        "lib": ["ES2020"], // TypeScript library definitions
        "outDir": "./dist", // Output directory for compiled JS
        "rootDir": "./src", // Root source directory
        "strict": true, // Enable all strict type checks
        "esModuleInterop": true, // CommonJS/ES module interop
        "skipLibCheck": true, // Skip type checking of declaration files
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true, // Allow JSON imports
        "declaration": true, // Generate .d.ts files
        "sourceMap": true // Generate source maps for debugging
    }
}
```

### Build and Development Scripts

```json
{
    "scripts": {
        "build": "tsc", // One-time compilation
        "dev": "tsc -w & nodemon dist/index.js", // Watch mode + auto-restart
        "start": "node dist/index.js", // Production run
        "clean": "rm -rf dist", // Clean build artifacts
        "type-check": "tsc --noEmit" // Check types without emitting
    }
}
```

### Compilation Workflow

1. **Development Workflow**:

    ```
    TypeScript (src/) → tsc -w → JavaScript (dist/) → nodemon → Restart Server
    ```

2. **Production Workflow**:
    ```
    npm run build → npm start
    ```

### Type Safety Best Practices

- Use **strict mode** to catch type errors at compile time
- Define interfaces for all data structures
- Use **generics** for reusable, type-safe utilities
- Leverage TypeScript's type inference to reduce boilerplate

---

## Testing

### Unit Testing with Jest

Jest provides isolated testing for individual functions and modules:

```bash
# Install Jest
npm install --save-dev jest ts-jest @types/jest

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

Example unit test:

```typescript
// src/utils/ExecutorFactory.test.ts
import { ExecutorFactory } from "./ExecutorFactory";
import { CppExecutor } from "../containers/cppExecutor";

describe("ExecutorFactory", () => {
    it("should create CppExecutor for cpp language", () => {
        const executor = ExecutorFactory.createExecutor("cpp");
        expect(executor).toBeInstanceOf(CppExecutor);
    });

    it("should throw error for unsupported language", () => {
        expect(() => ExecutorFactory.createExecutor("rust")).toThrow();
    });
});
```

### Input Validation Testing with Zod

Test that validation schemas work correctly:

```typescript
// src/validators/zodValidator.test.ts
import { submissionSchema } from "./zodValidator";

describe("Submission Validation", () => {
    it("should validate correct submission payload", () => {
        const valid = {
            language: "cpp",
            code: "#include <iostream>...",
            testCases: [{ input: "5", output: "120" }],
            timeLimit: 5000,
            memoryLimit: 256,
        };

        expect(() => submissionSchema.parse(valid)).not.toThrow();
    });

    it("should reject invalid language", () => {
        const invalid = {
            language: "rust", // Not supported
            code: "fn main() {}",
            testCases: [],
        };

        expect(() => submissionSchema.parse(invalid)).toThrow();
    });
});
```

### Load Testing with k6

Test service performance under load:

```javascript
// tests/load.test.js
import http from "k6/http";
import { check } from "k6";

export let options = {
    vus: 100, // 100 virtual users
    duration: "30s", // Run for 30 seconds
};

export default function () {
    const payload = JSON.stringify({
        language: "cpp",
        code: '#include <iostream>\nint main() { std::cout << "Hello"; }',
        testCases: [{ input: "", output: "Hello" }],
        timeLimit: 5000,
        memoryLimit: 256,
    });

    const res = http.post("http://localhost:8000/api/v1/submit", payload);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "response time < 500ms": (r) => r.timings.duration < 500,
    });
}
```

Run load test:

```bash
npm install -g k6
k6 run tests/load.test.js
```

### Integration Testing

Test the complete submission-to-evaluation flow:

```typescript
// tests/integration/submission.test.ts
import request from "supertest";
import app from "../../src/index";

describe("Submission Flow", () => {
    it("should execute C++ code and return correct result", async () => {
        const response = await request(app)
            .post("/api/v1/submit")
            .send({
                language: "cpp",
                code: `#include <iostream>
        int main() { 
          std::cout << "42"; 
          return 0;
        }`,
                testCases: [{ input: "", output: "42" }],
                timeLimit: 5000,
                memoryLimit: 256,
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("AC"); // Accepted
    }, 10000); // 10 second timeout
});
```

---

## Monitoring & Observability

### Bull Board UI

Bull Board provides a visual interface for queue monitoring:

```bash
# Access Bull Board at http://localhost:3001
# Default password: BULLBOARD_PASSWORD from environment

# Features:
# - View all queues (submission, evaluation, sample)
# - Inspect job details and progress
# - Retry failed jobs
# - Pause/resume queues
# - Real-time statistics
```

### Structured Logging with Winston

All events are logged as JSON for easy parsing and aggregation:

```typescript
// src/config/winston.config.ts
import winston from "winston";

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/app.log" }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

// Usage
logger.info("Submission received", {
    submissionId: "123",
    language: "cpp",
    userId: "user456",
});

logger.error("Execution failed", {
    submissionId: "123",
    error: "Time limit exceeded",
    timeLimit: 5000,
    actualTime: 6500,
});
```

Example log output:

```json
{
  "timestamp": "2024-01-05T10:30:45.123Z",
  "level": "info",
  "message": "Submission received",
  "submissionId": "123",
  "language": "cpp",
  "userId": "user456"
}

{
  "timestamp": "2024-01-05T10:30:50.456Z",
  "level": "error",
  "message": "Execution failed",
  "submissionId": "123",
  "error": "Time limit exceeded",
  "timeLimit": 5000,
  "actualTime": 6500
}
```

### Error Log Persistence

Critical errors are persisted to Azure Cosmos DB:

```typescript
// src/utils/errorLogger.ts
async function logExecutionError(submissionId: string, error: Error, context: ExecutionContext) {
    await cosmosDB.errors.create({
        submissionId,
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(),
        ttl: 7776000, // 90 days (Cosmos DB TTL)
    });
}
```

### Metrics and Traceability

Track key metrics for debugging:

- **Submission ID**: Unique identifier for each submission
- **User ID**: User who made the submission
- **Language**: Language used
- **Status**: Final evaluation status (AC, WA, TLE, etc.)
- **Execution Time**: Actual execution duration
- **Memory Used**: Peak memory consumption
- **Test Case Results**: Pass/fail per test case

---

## Scalability & Design Principles

### Event-Driven Architecture

The service operates on an **event-driven** model where:

- Services communicate via Redis queues (asynchronous)
- No direct service-to-service HTTP calls
- Jobs can be retried, prioritized, and scheduled

**Benefits**:

- Services are loosely coupled and independently scalable
- Failures in one service don't cascade to others
- Natural load leveling through queue buffers

### Horizontal Scaling

Multiple Evaluator Service instances can run in parallel:

```
┌──────────────┐
│ Submission   │
│ Service      │
└────┬─────────┘
     │ (queues to)
     ▼
┌────────────────────────────┐
│   Redis Queue              │
│  (submission-queue)        │
└────┬───────────────────────┘
     │
     ├──────────────────────────────────┐
     │                                  │
     ▼                                  ▼
┌──────────────────┐          ┌──────────────────┐
│ Evaluator-1      │          │ Evaluator-2      │
│ (Worker 1-5)     │          │ (Worker 1-5)     │
└──────────────────┘          └──────────────────┘

Each instance pulls from the same Redis queue independently.
BullMQ ensures atomic job delivery (no duplicate processing).
```

**Scaling Strategy**:

1. Run multiple instances of Evaluator Service
2. Each instance consumes from the same Redis queue
3. BullMQ handles atomic job assignment
4. Load distributes naturally across instances

### Stateless Execution

The service is **stateless**, meaning:

- No in-memory state persists between requests
- Each submission is independent
- Instances can be created/destroyed without coordination
- Horizontal scaling requires no session affinity

### Isolation Using Containers

Docker containers provide:

- **Process Isolation**: User code can't interfere with other submissions
- **Resource Limits**: CPU and memory are strictly bounded
- **Filesystem Isolation**: No access to host system
- **Security**: Malicious code is contained

### Production-Grade Design Patterns

#### Factory Pattern

Creates executors dynamically, enabling extensibility:

```typescript
const executor = ExecutorFactory.createExecutor(language);
```

#### Strategy Pattern

Each executor defines its own behavior:

```typescript
interface CodeExecutorStrategy {
    compileCommand(): string;
    runCommand(): string;
}
```

#### Producer-Consumer Pattern

Asynchronous job processing via BullMQ:

```typescript
// Producer (Submission Service)
await submissionQueue.add(submission);

// Consumer (Evaluator Service)
submissionQueue.process(async (job) => {
    return await executeSubmission(job.data);
});
```

#### Dependency Injection

Services receive dependencies via constructors:

```typescript
class SubmissionWorker {
    constructor(
        private logger: Logger,
        private executorFactory: ExecutorFactory,
        private evaluationProducer: EvaluationQueueProducer,
    ) {}
}
```

### Performance Optimization

- **Connection Pooling**: Redis connections are reused
- **Stream Processing**: Logs are processed chunk-by-chunk (not buffered)
- **Container Caching**: Language images are cached locally
- **Concurrent Processing**: Multiple workers process jobs in parallel
- **Job Timeouts**: Long-running executions are forcefully terminated

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint for code formatting
- Write unit tests for new features
- Keep functions small and focused
- Use meaningful variable names

---

## Support & Contact

For issues, questions, or suggestions:

- **GitHub Repository**: [ExecHub-Evaluator-Service](https://github.com/krishsingh120/ExceHub-Evaluator-Service)
- **GitHub Issues**: [Create an issue](https://github.com/krishsingh120/ExceHub-Evaluator-Service/issues)
- **Email**: krishsin@gmail.com
- **Documentation**: [ExecHub Docs](https://docs.exechub.io)

---

## Acknowledgments

- **BullMQ** for reliable job queue management
- **Dockerode** for Docker API abstraction
- **Winston** for structured logging
- **Zod** for runtime validation
- The open-source community for countless libraries that make this possible

---

**Last Updated**: January 5, 2026  
**Version**: 1.0.0  
**Maintainer**: ExecHub Development Team
