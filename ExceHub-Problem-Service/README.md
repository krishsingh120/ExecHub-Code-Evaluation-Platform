# ExecHub – Problem Service

ExecHub-Problem-Service is a dedicated microservice responsible for managing coding problems for the ExceHub platform — a LeetCode-like code execution and practice system.

## This service handles:
- Creation and management of coding problems.
- Storage of problem statements, test cases, and editorials.
- Markdown sanitization for safe and clean content delivery.
- Centralized logging.
- Versioned APIs using a layered MVC architecture.


## Service Responsibility
- Manage problem metadata (title, description, difficulty).
- Store test cases and editorials.
- Sanitize and normalize markdown content.
- Provide versioned REST APIs for other services / clients.
- Persist data using MongoDB (Azure Cosmos DB – Mongo API).

## Tech Stack
| Category | Technology |
|----------|------------|
| Runtime                |   Node.js |
| Framework              |   Express.js |
| Database               |   MongoDB (Azure Cosmos DB – Mongo API) |
| ODM                    |   Mongoose  |
| Logging                |   Winston + winston-mongodb |
| Markdown Parsing       |   Marked |
| Sanitization           |   sanitize-html |
| Markdown Normalization |   turndown |



## Architecture Overview
This service follows an advanced layered MVC architecture to ensure scalability, testability, and clean separation of concerns.

```arduino
Client
  ↓
API Router
  ↓
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Database (MongoDB / Azure Cosmos DB)
```

## Layer Responsibilities
- Routes → Define API endpoints.
- Controllers → Handle HTTP request/response.
- Services → Business logic.
- Repositories → Database interaction.
- Models → Schema definitions.
- Middlewares → Validation, error handling, logging.
- Errors → Centralized custom error classes.



## Folder Structure
```bash
ExecHub-Problem-Service
│
├── src
│   ├── clientapis        # External/internal service calls
│   ├── config            # DB, logger, env configs
│   ├── controllers       # Request handlers
│   ├── errors            # Custom error classes
│   ├── middlewares       # Express middlewares
│   ├── models            # Mongoose schemas
│   ├── repositories      # DB access layer
│   ├── routes            # API routes
│   ├── services          # Business logic
│   ├── utils             # Helper utilities
│   ├── validators        # Request validations
│   ├── index.js          # App entry point
│
├── .env
├── .gitignore
├── app.log               # Winston logs
├── package.json
├── README.md

```

## Database Schema (Problem)
```js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title cannot be empty'],
  },
  description: {
    type: String,
    required: [true, 'Description cannot be empty'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'easy',
  },
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String }
    }
  ],
  editorial: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
```

## Markdown Sanitization Pipeline
To ensure secure and clean problem content, markdown is processed in three stages:

1. Markdown → HTML
2. HTML Sanitization
3. Sanitized HTML → Markdown

flow: 
```css
Raw Markdown
   ↓
marked (Markdown → HTML)
   ↓
sanitize-html
   ↓
turndown (HTML → Markdown)
   ↓
Clean & Safe Markdown

```

## Utility Function
```js
function sanitizeMarkdownContent(markdownContent) {
  const turndownService = new TurndownService();

  const convertedHtml = markdown.parse(markdownContent);

  const sanitizedHtml = sanitizeHtmlLibrary(convertedHtml, {
    allowedTags: sanitizeHtmlLibrary.defaults.allowedTags.concat(['img'])
  });

  const sanitizedMarkdown = turndownService.turndown(sanitizedHtml);

  return sanitizedMarkdown;
}
```

## API Versioning Strategy
All APIs are versioned to ensure backward compatibility.
```bash
/api/v1/...
```

## Routing Flow Example
```bash
/api/v1/problems/ping
   ↓
apiRouter
   ↓
v1Router
   ↓
problemRouter
   ↓
problemController
   ↓
service
   ↓
repository
```



## Error Handling
A centralized error system is implemented using a dedicated `errors` folder.

### Error Categories
- badrequest
- base.error
- internalServer
- notfound
- notImplemented


## Logging Configuration (Winston)
- This project uses Winston as the centralized logging library with multiple transports for better observability and debugging.

### Libraries Used

- winston – Core logging library.
- winston-mongodb – Store logs in MongoDB.
- stream – Create custom writable stream.
- Azure Cosmos DB client (custom) – Remote error logging.

- Logs stored in:
    - Console
    - MongoDB (via winston-mongodb)
    - Local file (app.log)

### Logger Features
- Console logging (colored & timestamped).
- File-based logging (app.log).
- MongoDB error logs.
- Custom stream logging to Azure Cosmos DB.
- Centralized error-level logging.

#### Log Format
```js
YYYY-MM-DD HH:mm:ss [LEVEL] : message
```
#### Example
```js
2025-01-28 16:07:21 [ERROR] : Database connection failed
```

## Environment Variables
Create a .env file in the root directory:
```env

PORT=3000

# MongoDB (Primary Database)
ATLAS_DB_URL=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>

# MongoDB (Logging Database)
LOG_DB_URL=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>

# Application Environment
NODE_ENV=development

# Azure Cosmos DB (Centralized Error Logging)
COSMOS_ENDPOINT=https://<your-cosmos-account>.documents.azure.com:443/
COSMOS_KEY=<your-cosmos-primary-key>
COSMOS_DB_ID=winston-error-logging
COSMOS_CONTAINER_ID=error-logs

```

## Getting Started
1. Clone Repository
```bash
git clone https://github.com/kakusingh120/ExceHub-Problem-Service.git
```
2. Install Dependencies
```bash
cd ExecHub-Problem-Service
npm install
```
3. Setup Environment
Create .env and configure required variables.

4. Start Server
```bash
npm start
```


## 👨‍💻 Author

**Krish Singh**  
Backend & Full-Stack Developer 🚀  

[GitHub](https://github.com/krishsingh120) • 
[LinkedIn](https://www.linkedin.com/in/krish-singh-9023b12a8/)
















