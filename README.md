# ExecHub – Distributed Code Execution Platform (Backend)

A **production-grade, microservices-based code execution and evaluation platform** designed to handle high-concurrency submissions, isolated code execution, and real-time result delivery.

---

## High-Level Architecture (HLD)

![ExecHub Backend Architecture](https://raw.githubusercontent.com/krishsingh120/ExecHub-HLD-Image/refs/heads/main/Final_archi.png)

This diagram represents the **end-to-end submission lifecycle** from client request through code execution to result notification. The architecture demonstrates:

- **Synchronous service-to-service communication** for problem metadata retrieval
- **Asynchronous queue-based processing** for scalable code execution
- **Real-time WebSocket delivery** for instant status updates
- **Isolated Docker execution environments** for secure, sandboxed code execution

---

## System Overview

ExecHub is built on a **distributed microservices architecture** following **clean architecture and HLD/LLD principles**. The platform enables:

- **High-concurrency submission handling** through queue-based load leveling
- **Asynchronous code execution** using isolated Docker containers
- **Real-time status updates** via WebSocket connections
- **Scalable evaluation pipelines** with independent service scaling
- **Language-agnostic code execution** supporting Python, Java, C++, and more
- **Fault-tolerant design** with retry mechanisms and dead-letter queue handling

---

## Services Overview

### 1. Problem Admin Service

**Responsibility:**

- Manages problem metadata, statements, test cases, and constraints
- Acts as the **single source of truth** for all problem-related data
- Provides synchronous REST APIs for problem retrieval
- Stores problems in MongoDB/Azure CosmosDB

**Communication:**

- Synchronous REST API (consumed by Submission Service)
- Database: MongoDB/CosmosDB

**GitHub Repository:**
https://github.com/krishsingh120/ExceHub-Problem-Service.git

---

### 2. Submission Service (Core Orchestrator)

**Responsibility:**

- Entry point for all code submissions from clients
- Coordinates synchronous problem fetching from Problem Admin Service
- Creates and persists submission records
- Publishes submissions to the Redis queue (async processing)
- Consumes evaluation results and updates submission status
- Orchestrates WebSocket notifications for real-time updates

**Communication:**

- **Synchronous:** REST calls to Problem Admin Service
- **Asynchronous:** Redis BullMQ submission and evaluation queues
- **Real-time:** REST calls to WebSocket Service for status broadcasts

**GitHub Repository:**
https://github.com/krishsingh120/ExceHub-Submission-Service.git

---

### 3. Evaluator Service

**Responsibility:**

- Consumes submission jobs from Redis queue (BullMQ)
- Executes user code in **isolated Docker containers**
- Matches code output against expected test case outputs
- Generates detailed evaluation reports (pass/fail, execution time, memory usage)
- Publishes evaluation results to the evaluation queue
- Handles language-specific execution strategies

**Communication:**

- **Asynchronous:** Redis BullMQ submission queue (consumer)
- **Asynchronous:** Redis BullMQ evaluation queue (producer)
- **Docker:** Dockerode for container lifecycle management

**Key Features:**

- Multi-language support (Python, Java, C++)
- Timeout and memory limit enforcement
- Secure, isolated execution environments
- Structured error reporting

**GitHub Repository:**
https://github.com/krishsingh120/ExceHub-Evaluator-Service.git

---

### 4. WebSocket (Socket) Service

**Responsibility:**

- Maintains persistent WebSocket connections with clients
- Broadcasts **real-time submission status updates**
- Manages client-to-socket mapping with Redis + in-memory cache
- Handles connection lifecycle (connect, disconnect, reconnect)
- Sends execution progress, compilation errors, and final results

**Communication:**

- **WebSocket:** Bidirectional real-time client connections
- **REST:** Receives notifications from Submission Service
- **Redis:** For distributed socket session management (multi-instance deployments)

**GitHub Repository:**
https://github.com/krishsingh120/ExceHub-Socket-Service.git

---

## Complete End-to-End Submission Flow

The following diagram represents the **14-step submission lifecycle**, aligned with the HLD:

```
┌──────────────┐
│    Client    │
└──────┬───────┘
       │ (1) Submit code + problem ID
       ▼
┌──────────────────────────────────────────────────────────────────┐
│        SUBMISSION SERVICE (Core Orchestrator)                    │
│  (2) Synchronous request ───────┐                               │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ PROBLEM ADMIN SERVICE       │
                    │ (3) Fetch problem metadata  │
                    │ (4) Return problem details  │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │      MongoDB/CosmosDB    │
                    │    (Problem Store)       │
                    └──────────────────────────┘
       │ (4) Problem details returned
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ (5) Create submission entry in database                          │
│ (6) Publish submission to Redis queue (BullMQ)                  │
│ (7) Send acknowledgment to client                               │
└──────────────────────────────────────────────────────────────────┘
       │
       │ (Asynchronous)
       ▼
┌──────────────────────────────────────────────────────────────────┐
│          EVALUATOR SERVICE (BullMQ Consumer)                     │
│  (8) Consume submission from queue                              │
│  (9) Execute code in isolated Docker container                 │
│  (10) Match output against test cases                          │
│  (11) Publish evaluation result to evaluation queue            │
└──────────────────────────────────────────────────────────────────┘
       │
       │ (Asynchronous)
       ▼
┌──────────────────────────────────────────────────────────────────┐
│       SUBMISSION SERVICE (Evaluation Result Consumer)            │
│  (12) Consume evaluation result                                 │
│  (13) Update submission status in database                     │
│  (14) Notify WebSocket Service of status change               │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│          WEBSOCKET SERVICE                                       │
│  Broadcast real-time status update to connected client          │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│    Client    │ ◄─── Receives execution status update
└──────────────┘
```

### Step-by-Step Flow:

1. **Client Submission** – User submits code + problem ID to Submission Service REST endpoint
2. **Sync Request Initiated** – Submission Service makes synchronous request to Problem Admin Service
3. **Problem Metadata Fetch** – Problem Admin Service queries MongoDB/CosmosDB for problem details
4. **Problem Details Returned** – Problem data (test cases, constraints, expected output) returned to Submission Service
5. **Database Persistence** – Submission entry created with metadata in Submission Service database
6. **Queue Publishing** – Submission payload published to Redis BullMQ submission queue
7. **Client Acknowledgment** – Submission Service returns immediate ACK to client (with submission ID)
8. **Job Consumption** – Evaluator Service consumes submission job from Redis queue
9. **Code Execution** – User code executed in isolated Docker container (with timeout/memory limits)
10. **Test Case Matching** – Output compared against all test cases; detailed results generated
11. **Result Publishing** – Evaluation result pushed to Redis BullMQ evaluation queue
12. **Result Consumption** – Submission Service consumes evaluation result asynchronously
13. **Status Update** – Submission record updated in database with evaluation result and status (PASSED/FAILED)
14. **Real-Time Notification** – WebSocket Service broadcasts result to client via persistent WebSocket connection

---

## Communication Patterns

### Synchronous Communication (Request-Response)

**Submission Service ↔ Problem Admin Service**

- REST API calls using Express/Fastify
- Blocks until problem metadata is retrieved
- Ensures consistency of problem definitions
- Low-latency direct service calls

**Use Case:** Validate problem existence and fetch test cases before queueing submission

---

### Asynchronous Communication (Event-Driven)

**Service-to-Service via Redis BullMQ Queues**

- Decoupled producer-consumer pattern
- Non-blocking, scalable job processing
- Built-in retry, timeout, and dead-letter queue support

**Queues in Use:**

1. **Submission Queue** – Carries new submissions from Submission Service to Evaluator Service
2. **Evaluation Queue** – Carries evaluation results from Evaluator Service back to Submission Service

**Advantages:**

- Load leveling: Submission spikes don't overwhelm evaluators
- Independent scaling: Add evaluator instances without modifying submission service
- Fault tolerance: Failed jobs can be retried
- Observability: Bull Board UI monitors queue health

---

### Real-Time Communication (WebSocket)

**Submission Service ↔ WebSocket Service ↔ Client**

- Persistent bidirectional connections
- Server-initiated status updates
- Redis-backed session management for distributed deployments

---

## Tech Stack

### Runtime & Frameworks

| Component    | Technology              |
| ------------ | ----------------------- |
| **Runtime**  | Node.js (v18+)          |
| **Language** | TypeScript / JavaScript |
| **APIs**     | Express.js / Fastify    |

### Messaging & Queue Management

| Component            | Technology    |
| -------------------- | ------------- |
| **Message Broker**   | Redis         |
| **Queue Framework**  | BullMQ        |
| **Queue Monitoring** | Bull Board UI |

### Data Storage

| Component            | Technology                              |
| -------------------- | --------------------------------------- |
| **Primary Database** | MongoDB                                 |
| **Alternative**      | Azure CosmosDB (MongoDB API)            |
| **Cache**            | Redis (distributed) + In-memory (local) |

### Code Execution & Sandboxing

| Component               | Technology                     |
| ----------------------- | ------------------------------ |
| **Containerization**    | Docker                         |
| **Container SDK**       | Dockerode (Node.js)            |
| **Supported Languages** | Python, Java, C++ (extensible) |

### Real-Time Communication

| Component              | Technology                        |
| ---------------------- | --------------------------------- |
| **Protocol**           | WebSocket (Socket.IO / native ws) |
| **Session Management** | Redis + In-memory cache           |

### Observability & Validation

| Component               | Technology |
| ----------------------- | ---------- |
| **Logging**             | Winston    |
| **Schema Validation**   | Zod        |
| **Queue Visualization** | Bull Board |

---

## Low-Level Design (LLD) Patterns

### Factory Pattern

**Location:** Evaluator Service (`ExecutorFactory`, language-specific executors)

**Purpose:**

- Abstract creation of language-specific code executors
- Enables runtime selection of appropriate executor based on language

**Implementation:**

```
ExecutorFactory
├── JavaExecutor (for Java submissions)
├── PythonExecutor (for Python submissions)
└── CppExecutor (for C++ submissions)
```

**Benefits:**

- Easy addition of new language support without modifying core logic
- Encapsulates language-specific execution logic
- Promotes code reusability

---

### Strategy Pattern

**Location:** Evaluator Service (evaluation and execution strategies)

**Purpose:**

- Define different evaluation strategies per language/runtime
- Allow runtime selection of appropriate strategy

**Use Cases:**

- Different compilation steps for compiled vs. interpreted languages
- Language-specific output matching algorithms
- Varied timeout/memory enforcement based on language overhead

**Benefits:**

- Closed for modification, open for extension (SOLID principle)
- Cleaner separation of concerns
- Reduces conditional logic throughout the codebase

---

### Producer-Consumer Pattern

**Location:** Redis BullMQ queues

**Purpose:**

- Decouple submission production from evaluation consumption
- Enable independent scaling of producers and consumers

**Implementation:**

- Submission Service = Producer (publishes to submission queue)
- Evaluator Service = Consumer (processes submissions)
- Evaluator Service = Producer (publishes to evaluation queue)
- Submission Service = Consumer (processes results)

**Benefits:**

- Non-blocking, asynchronous job processing
- Horizontal scalability of evaluator instances
- Load leveling and peak handling
- Automatic retry on failure

---

## Scalability & Reliability Design

### Horizontal Scaling

**Evaluator Service Scaling:**

- Stateless design allows unlimited horizontal scaling
- Each instance independently consumes from BullMQ
- Auto-scaling based on queue depth and CPU utilization
- No shared state between instances

**Problem Admin Service Scaling:**

- Database connection pooling for concurrent requests
- Can run multiple instances behind a load balancer
- MongoDB/CosmosDB handles concurrent reads efficiently

---

### Load Leveling

**Queue-Based Architecture:**

- Submission queue acts as a buffer for spike handling
- Sudden submission surge doesn't overwhelm evaluators
- Queued jobs processed at evaluator capacity rate
- Prevents cascading failures

---

### Fault Tolerance

**Queue-Based Retry:**

- BullMQ provides built-in exponential backoff retry strategy
- Configurable max retry attempts
- Dead-letter queue for permanently failed jobs

**Service Isolation:**

- Evaluator failure doesn't block submission creation
- Problem service failure returns meaningful error to client
- Circuit breaker patterns prevent cascading failures (optional enhancement)

**Container-Level Safety:**

- Isolated Docker containers prevent code from affecting host
- Timeout enforcement kills runaway processes
- Memory limits prevent resource exhaustion

---

### Monitoring & Observability

**Queue Health:**

- Bull Board UI provides real-time queue visualization
- Job history, completed count, failed count, retry tracking

**Logging:**

- Winston structured logging across all services
- Traces for end-to-end submission flow
- Error tracking and alerting

---

## Repository Structure

This repository represents the **system-level backend architecture** of ExecHub. The structure is organized as:

```
ExecHubBackend/
├── ExceHub-Problem-Service/        # Problem metadata management
├── ExceHub-Submission-Service/     # Submission orchestration
├── ExceHub-Evaluator-Service/      # Code execution & evaluation
├── ExceHub-Socket-Service/         # Real-time WebSocket delivery
├── Sample-Socket-Frontend/         # Demo client for testing
└── README.md                        # This file (System HLD)
```

### Individual Service Repositories

Each microservice has its **own dedicated GitHub repository** with:

- **Deep, service-specific README** covering setup, API documentation, and internal architecture
- **Source code** with clean architecture separation (controllers, services, repositories, etc.)
- **Configuration management** for different environments (dev, staging, prod)
- **Testing** (unit, integration, load tests)
- **Deployment documentation**

**This root README focuses on system-level HLD.** For service-specific details, refer to each service's GitHub repository.

---

## Why This Architecture

### Why Microservices?

- **Independent Scaling:** Evaluator Service can be scaled independently during high load
- **Technology Flexibility:** Each service can choose its own tech stack if needed
- **Team Scalability:** Different teams can own different services
- **Fault Isolation:** Service failures don't bring down the entire system

### Why Queue-Based Processing?

- **Decoupling:** Submission creation is instantly responsive; evaluation happens asynchronously
- **Load Leveling:** Prevents overload during traffic spikes
- **Visibility:** Bull Board provides queue monitoring and dead-letter tracking
- **Reliability:** Built-in retry mechanisms

### Why Docker for Code Execution?

- **Security:** Isolated sandboxed environment prevents malicious code from escaping
- **Consistency:** Same environment across all machines (dev, staging, prod)
- **Multi-language Support:** Language-specific Docker images
- **Resource Limits:** Container-level CPU and memory restrictions

### Why WebSocket for Real-Time Updates?

- **Instant Feedback:** Users see execution status immediately
- **Reduced Polling:** No need for client-side polling loops
- **Persistent Connection:** Efficient for multiple status updates

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Docker and Docker Compose
- Redis server (local or containerized)
- MongoDB or Azure CosmosDB account

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/krishsingh120/ExecHub-Code-Evaluation-Platform.git
   cd ExecHubBackend
   ```

2. **Setup each service** (follow service-specific README):

   ```bash
   cd ExceHub-Problem-Service && npm install && npm run dev
   cd ExceHub-Submission-Service && npm install && npm run dev
   cd ExceHub-Evaluator-Service && npm install && npm run dev
   cd ExceHub-Socket-Service && npm install && npm run dev
   ```

3. **Start Redis:**

   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

4. **Access Bull Board (Queue Monitoring):**
   - Navigate to `http://localhost:3000/admin/queues` (adjust port per service)

### Service-Specific Documentation

For detailed setup, API documentation, and architecture diagrams, refer to each service's README:

- [Problem Admin Service Setup](https://github.com/krishsingh120/ExceHub-Problem-Service)
- [Submission Service Setup](https://github.com/krishsingh120/ExceHub-Submission-Service)
- [Evaluator Service Setup](https://github.com/krishsingh120/ExceHub-Evaluator-Service)
- [WebSocket Service Setup](https://github.com/krishsingh120/ExceHub-Socket-Service)

---

## Who Is This Project For

### Backend Interview Preparation

- **System Design:** Learn end-to-end microservices architecture
- **HLD & LLD:** Study high-level design decisions and low-level implementation patterns
- **Problem Solving:** Understand trade-offs in distributed systems design

### Learning Distributed Systems

- **Asynchronous Processing:** Queue-based job handling with BullMQ
- **Service-to-Service Communication:** Sync REST + async event-driven patterns
- **Real-Time Systems:** WebSocket delivery and status broadcasting
- **Scalability:** Horizontal scaling, load leveling, fault tolerance

### Building Real-World Applications

- **Production-Grade Code:** Reference implementation of clean architecture
- **Microservices:** Multi-service deployment and orchestration
- **Code Execution:** Sandboxed code running with Docker
- **Real-Time Updates:** WebSocket-based client notifications

---

## Performance Considerations

### Submission Latency

- Client receives ACK in <50ms (synchronous submission creation)
- Evaluation starts within 100-500ms (queue processing latency)
- Real-time updates delivered within 1-2s of evaluation completion

### Throughput

- Single Submission Service instance: ~1000 submissions/minute
- Single Evaluator instance: ~100-500 submissions/minute (language-dependent)
- Horizontal scaling: Linear throughput increase with evaluator instances

### Resource Usage

- Each Evaluator instance: ~1-2GB RAM, 1-2 CPU cores
- Redis: ~100MB RAM for typical load
- Docker: ~500MB per running container

---

## Contributing

This is a demonstration project for learning and interview preparation. Contributions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---


## Acknowledgments

- Inspired by real-world online code execution platforms
- Built following SOLID principles and clean architecture patterns
- Community contributions and feedback are appreciated

---

## Contact & Support

For questions about the architecture, system design, or setup:

**Developed by Krish Singh**  
Backend & Systems Engineering Enthusiast

- GitHub: [@krishsingh120](https://github.com/krishsingh120)
- Email: [Contact via GitHub](krishsin2254@gmail.com)

---

## Roadmap & Future Enhancements

### Planned Features

- [ ] Support for more programming languages (Go, Rust, JavaScript)
- [ ] Advanced metrics and analytics (execution time trends, success rates)
- [ ] Code plagiarism detection
- [ ] Collaborative coding sessions
- [ ] Custom test case runner UI
- [ ] API rate limiting and authentication
- [ ] Kubernetes deployment manifests

### Performance Improvements

- [ ] CPU/GPU optimization for intensive workloads
- [ ] Caching compiled binaries for repeated submissions
- [ ] Distributed tracing (Jaeger/DataDog integration)

---

**Last Updated:** January 2026  
**Version:** 1.0 (Production-Ready)

