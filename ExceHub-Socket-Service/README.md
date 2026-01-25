# ExecHub-Socket-Service

A lightweight WebSocket microservice for real-time code execution updates in the ExecHub platform.

---

## 1. Service Overview

- Real-time WebSocket communication service
- Delivers live execution status updates
- Eliminates HTTP polling overhead
- Enables instant client feedback

---

## 2. Service Responsibilities

- Manage persistent WebSocket connections
- Store userId → socketId mappings in Redis
- Push execution status to connected clients
- Handle client disconnections gracefully

---

## 3. Role in System Architecture

- Entry point for real-time client communication
- Receives status updates from Submission Service
- Looks up socket via Redis mapping
- Emits events to correct client

---

## 4. End-to-End Real-Time Flow

1. Client connects via WebSocket
2. Server stores userId → socketId in Redis
3. Client submits code to Submission Service
4. After evaluation, Submission Service notifies Socket Service
5. Socket Service queries Redis for socketId
6. Emits execution result to client instantly

---

## 5. Why WebSockets (Socket.IO)

- **Server push** - No polling overhead
- **Low latency** - Sub-100ms event delivery
- **Efficient** - Minimal network traffic
- **Scalable** - Works with load balancing

---

## 6. Redis Strategy

- Centralized user-socket mappings
- Enables horizontal scaling
- Single source of truth
- Shared cache across instances

---

## 7. Architecture Highlights

- **Stateless** - All state in Redis
- **Event-driven** - Loose coupling between services
- **Scalable** - Add instances behind load balancer
- **Resilient** - Automatic reconnection handling

---

## 8. Folder Structure

```
src/
├── index.js              # Express + Socket.IO setup
└── config/
    ├── server.config.js  # Server configuration
    └── redis.config.js   # Redis configuration
```

---

## 9. WebSocket Events

### Incoming

- `register_user` - { userId, token }

### Outgoing

- `submission_status_update` - { submissionId, status }
- `execution_result` - { submissionId, result, status }
- `error` - { code, message }

---

## 10. Tech Stack

- Node.js - Runtime
- Express - HTTP server
- Socket.IO - WebSocket library
- Redis / ioredis - Session cache
- dotenv - Configuration

---

## 11. Environment Variables

```bash
PORT=3001
NODE_ENV=development
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
CORS_ORIGIN=http://localhost:3000
```

---

## 12. Quick Start

```bash
git clone https://github.com/krishsingh120/ExceHub-Socket-Service.git
cd ExceHub-Socket-Service
npm install
npm start
```

---

## 13. Error Handling

- Client disconnect → Remove Redis mapping
- Redis failure → Auto-reconnect with backoff
- Invalid token → Force disconnect
- Socket cleanup → Release resources

---

## 14. Security

- JWT token validation on connection
- User ID verification for events
- CORS with specific origins
- Use WSS (WebSocket Secure) in production

---

## 15. Scalability

- Stateless design enables horizontal scaling
- Multiple instances behind load balancer
- Redis resolves socket across instances
- No in-memory dependency

---

## 16. Design Principles

- Event-driven architecture
- Loose coupling between services
- Stateless socket servers
- Asynchronous message handling

---

## 17. Monitoring

- Track active connections
- Monitor event delivery latency
- Track Redis performance
- Log connection/disconnection events

---

## 18. Future Improvements

- Centralized auth middleware
- Message retry strategy
- Socket.IO rooms/namespaces
- Rate limiting per user

---

## 19. Development

```bash
npm start           # Start with auto-reload
curl localhost:3001 # Health check
```

---

## 👨‍💻 Author

**Krish Singh** - Backend & Full-Stack Developer 🚀

[GitHub](https://github.com/krishsingh120) • [LinkedIn](https://www.linkedin.com/in/krish-singh-9023b12a8/)
