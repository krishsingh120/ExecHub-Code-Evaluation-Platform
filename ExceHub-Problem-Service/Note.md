# ExceHub Problem Service - Development Notes

## Table of Contents

1. [Pre-Requisites](#pre-requisites)
2. [API Testing](#api-testing)
3. [Environments](#environments)
4. [Performance Testing](#performance-testing)
5. [Unit Testing Scripts](#unit-testing-scripts)
6. [Monitoring](#monitoring)
7. [Topics to Cover](#topics-to-cover)
8. [Winston Logging](#winston-logging)
9. [Azure Cosmos DB](#azure-cosmos-db)
10. [Database Comparisons](#database-comparisons)
11. [Client Class Architecture](#client-class-architecture)

---

## Pre-Requisites

### Postman Setup (Already Covered)

1. **Create Variables in Postman** for API testing
2. **Use Environment-Based Variables** to manage different endpoints

### Example Curl Command

```bash
curl --location 'http://{{URL}}/api/v1/problems/ping' \
--header 'Cookies: Cookie_2=value' \
--header 'TEST=value'
```

---

## API Testing

### Postman Request Format

- **Method**: GET/POST/PUT/DELETE
- **URL**: Use variables as per environment
- **Headers**: Include Content-Type and required cookies
- **Body**: JSON format for POST/PUT requests

---

## Environments

### Development

```
Local Machine: http://localhost:3000/api/v1/problem
```

### Staging

```
UAT/Preview (Replica of Prod): http://{uat-url}/api/v1/problem
```

### Production

```
Production Environment: http://{prod-url}/api/v1/problem
```

### Hotfix

```
Hotfix Environment: (URL to be configured)
```

---

## Performance Testing

### Load Testing Strategy

#### Single User (SWE)

- Sole consumer
- Single user testing
- Baseline performance metrics

#### Multiple Users (Parallel Testing)

- **20 concurrent users** sending requests simultaneously
- **Fixed intervals** - Users send requests at particular times
- Measures system capacity and response time under load

### Tools

- **K6** - Load testing tool (k6-load.js in project)

---

## Unit Testing Scripts

### Basic Postman Test Syntax

#### Test 1: Status Code Validation

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});
```

#### Test 2: Content-Type Validation

```javascript
pm.test("Content-type is application/json", function () {
  pm.expect(pm.response.headers.get("Content-Type")).to.include(
    "application/json"
  );
});
```

#### Test 3: Response Body is Array

```javascript
pm.test("Response body is an array", function () {
  let jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an("array");
});
```

#### Test 4: Response Structure Validation

```javascript
pm.test("Response structure is valid", function () {
  let jsonData = pm.response.json();

  pm.expect(jsonData).to.be.an("object");
  pm.expect(jsonData).to.have.all.keys("success", "message", "error", "data");

  jsonData.data.forEach((problem) => {
    pm.expect(problem).to.have.all.keys(
      "_id",
      "title",
      "description",
      "difficulty",
      "testCases",
      "editorial",
      "createdAt",
      "updatedAt",
      "__v"
    );
  });
});
```

---

## Monitoring

### Health Monitoring

Continuously check the health and performance of the API by:

- Monitoring uptime and availability
- Tracking response times
- Monitoring resource usage (CPU, memory)
- Setting up alerts for failures
- Logging all requests and responses

---

## Topics to Cover

### 1. Introduction to Azure

- Cloud computing platform by Microsoft
- Global infrastructure and services
- Benefits and use cases

### 2. Azure Cosmos DB (NoSQL Database)

- Distributed database service
- Global scalability and availability
- Document-based storage

### 3. Project Integration

- Integrate Azure Cosmos DB to ExceHub Problem Service
- Set up logging with Winston
- Store logs in Cosmos DB

---

## Winston Logging

### Pre-Requisites

- Knowledge about logging
- Understanding of Winston logger

### Implementation

```
project -> Logging (winston) => store these logs in cosmos DB
```

### Key Questions

1. How to integrate Cosmos DB to any project?
2. How to store Winston logs in Cosmos DB?

### Benefits of Cosmos DB Logging

- **Efficient Search/Querying** - Easily search through logs
- **Scalability** - Handle large volumes of logs
- **Global Distribution** - Access logs from anywhere

---

## Azure Cosmos DB

### Overview

Azure Cosmos DB is a globally distributed, NoSQL database service optimized for:

- **Huge amounts of data**
- **Document-based storage**
- **Key-value pairs**
- **Multi-region availability**

### Why Choose Cosmos DB?

1. **Efficient Search/Querying** - Powerful query engine
2. **Global Scalability** - Replicate data across regions
3. **High Availability** - 99.99% SLA
4. **Multiple APIs** - MongoDB, SQL, Cassandra, Gremlin compatibility

### Setup and Configuration

#### Subscription Structure (Azure)

```
Organization/Subscription

├── Team 1 (Resource Group 1)
│   └── Cosmos DB Account: ExceHub
│       ├── Database 1
│       ├── Database 2
│       └── Database 3
│
├── Team 2 (Resource Group 2)
│
└── Team 3 (Resource Group 3)
```

#### Resource Hierarchy

```
Cosmos DB Account (ExceHub)
└── Databases
    └── Containers (equivalent to Collections/Tables)
        └── Documents
```

---

## Database Comparisons

### MongoDB vs Cosmos DB

| Aspect                | MongoDB                 | Cosmos DB             |
| --------------------- | ----------------------- | --------------------- |
| **Database**          | Database                | Database              |
| **Tables**            | Collections             | Containers            |
| **Rows**              | Documents               | Documents             |
| **Scalability**       | Single region primarily | Global multi-region   |
| **Deployment**        | Self-hosted or Atlas    | Managed Azure service |
| **API Compatibility** | MongoDB native          | MongoDB API available |
| **High Availability** | Replica sets            | Built-in with SLA     |

---

## Client Class Architecture

### CosmosClient Class

A dedicated client class to handle all Cosmos DB operations.

```javascript
class CosmosClient {
  // Initialization and connection

  // CRUD Operations
  addToCosmos()      // Create
  readFromCosmos()   // Read
  updateInCosmos()   // Update
  deleteFromCosmos() // Delete

  // Logging Operations
  addLogsToCosmosDB()
}
```

### Basic CRUD Operations

#### 1. Create (Add to Cosmos)

```javascript
addToCosmos()
- Insert new documents
- Set timestamps
- Handle validation
```

#### 2. Read (Query from Cosmos)

```javascript
readFromCosmos()
- Retrieve documents by ID
- Query with filters
- Support pagination
```

#### 3. Update (Modify in Cosmos)

```javascript
updateInCosmos()
- Update document fields
- Maintain audit trail
- Update timestamps
```

#### 4. Delete (Remove from Cosmos)

```javascript
deleteFromCosmos()
- Soft delete (recommended)
- Hard delete
- Maintain data integrity
```

### 2. Connect Winston Logs

Integration steps:

1. Configure Winston logger
2. Create Cosmos DB transport
3. Store all application logs in Cosmos DB
4. Set up log queries and analytics

---

## Implementation Roadmap

### Phase 1: Setup

- [ ] Create Azure Cosmos DB account
- [ ] Configure database and containers
- [ ] Set up authentication

### Phase 2: Integration

- [ ] Implement CosmosClient class
- [ ] Create CRUD operations
- [ ] Add error handling

### Phase 3: Logging

- [ ] Integrate Winston logger
- [ ] Create Cosmos DB transport
- [ ] Test logging pipeline

### Phase 4: Testing

- [ ] Unit tests for CRUD operations
- [ ] Integration tests
- [ ] Performance testing

---

## Hosting Platforms Comparison

| Platform  | Provider  | Service                  | Best For                      |
| --------- | --------- | ------------------------ | ----------------------------- |
| **Azure** | Microsoft | Cosmos DB, App Service   | Enterprise, .NET ecosystem    |
| **AWS**   | Amazon    | DynamoDB, DocumentDB     | Large-scale, highly available |
| **GCP**   | Google    | Firestore, Cloud Spanner | Real-time, analytics          |

---

## Key Takeaways

1. **Environment Variables** - Use different URLs for different environments
2. **Postman Testing** - Comprehensive test scripts for all endpoints
3. **Load Testing** - Monitor performance with multiple concurrent users
4. **Cosmos DB** - Global, scalable NoSQL solution
5. **Winston Logs** - Centralized logging in Cosmos DB
6. **CosmosClient** - Single source of truth for database operations

---

## Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [K6 Load Testing](https://k6.io/)
- [MongoDB vs Cosmos DB](https://docs.microsoft.com/azure/cosmos-db/mongodb-vs-cosmosdb)

---

**Last Updated**: December 28, 2025

# CosmosDB and MongoDB

> cosmosDB scalability globally.
> Data modeling.
> Transactionality
