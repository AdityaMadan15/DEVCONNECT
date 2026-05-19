# PERSON 1 BACKEND COMPLETION REPORT (DevConnect)

## 1. Purpose of this document
This document explains everything that was required in Person 1 backend work, what was implemented, where it was implemented, and how to answer viva questions confidently.

The backend was refactored from file-based JSON storage to MongoDB + Mongoose with MVC architecture, then stabilized for frontend compatibility.

---

## 2. Final architecture summary

### Previous approach
- Data persisted in JSON files.
- Backend logic was not fully modular for production patterns.

### Final approach
- Node.js + Express backend with MongoDB Atlas.
- Mongoose models for data schema and validation.
- MVC layering:
  - Models: data structure and DB rules
  - Controllers: business logic and responses
  - Routes: endpoint mapping
  - Config: DB connection setup
  - App bootstrap in server/index.js

---

## 3. File map: what to open for what feature

### App bootstrap and middleware
- server/index.js
  - Express app creation
  - CORS + JSON middleware
  - Health endpoint
  - SSE safe endpoint
  - API and compatibility route mounting
  - 404 and global error middleware

### DB connection
- server/config/db.js
  - MongoDB connection using mongoose.connect(process.env.MONGO_URI)
  - Fail-fast with process.exit(1)

### Models
- server/models/User.js
  - User schema
- server/models/Project.js
  - Project schema with owner/members references
- server/models/Request.js
  - Request schema with status enum including declined
- server/models/Message.js
  - Message schema

### Controllers
- server/controllers/project.controller.js
  - createProject, getProjects, getProjectById, updateProject, deleteProject
  - owner query filtering and populate
- server/controllers/user.controller.js
  - getAllUsers, getUser, updateUser
- server/controllers/request.controller.js
  - createRequest, getRequests, updateRequest, deleteRequest
  - to/from/projectId query filtering

### Routes
- server/routes/project.routes.js
- server/routes/user.routes.js
- server/routes/request.routes.js

---

## 4. Person 1 required work and completion status

## Step 1: MongoDB connection setup
### Requirement
Create DB config and connect using environment variable.

### Implemented
- Created connectDB in server/config/db.js.
- Uses process.env.MONGO_URI.
- Logs success host and exits on failure.

### Evidence file
- server/config/db.js

Status: DONE

---

## Step 2: Mongoose models
### Requirement
Create User, Project, Request, Message models.

### Implemented
- User model: name, email unique, password, avatar, skills, createdAt.
- Project model: title, description, techStack, owner ref, members refs, status enum, githubLink, createdAt.
- Request model: from ref, to ref, projectId ref, status enum, createdAt.
- Message model: projectId ref, sender ref, text, createdAt.

### Evidence files
- server/models/User.js
- server/models/Project.js
- server/models/Request.js
- server/models/Message.js

Status: DONE

---

## Step 3: Remove JSON runtime persistence
### Requirement
No backend runtime dependence on users.json/projects.json/requests.json.

### Implemented
- Runtime logic moved to Mongoose operations in controllers.
- No JSON-file read/write logic in server code path.

### Evidence files
- server/controllers/project.controller.js
- server/controllers/user.controller.js
- server/controllers/request.controller.js

Status: DONE

---

## Step 4: Controller logic (MVC business layer)
### Requirement
Implement project, user, request controller methods with proper status handling.

### Implemented
- Project controller with full CRUD.
- User controller with get all, get by id, update.
- Request controller with create/list/update/delete.
- Uses try/catch and returns structured responses.

### Evidence files
- server/controllers/project.controller.js
- server/controllers/user.controller.js
- server/controllers/request.controller.js

Status: DONE

---

## Step 5: Route definitions
### Requirement
Connect route paths to controller methods.

### Implemented
- Project routes: GET /, POST /, GET /:id, PUT /:id, DELETE /:id.
- User routes: GET /, GET /:id, PUT /:id.
- Request routes: GET /, POST /, PUT /:id, DELETE /:id.

### Evidence files
- server/routes/project.routes.js
- server/routes/user.routes.js
- server/routes/request.routes.js

Status: DONE

---

## Step 6: index.js refactor and mount routes
### Requirement
Use express, express.json, db connect, route mounting.

### Implemented
- Mounted required prefixed routes:
  - /api/projects
  - /api/users
  - /api/requests
- Added compatibility non-prefixed routes for frontend:
  - /projects
  - /users
  - /requests

### Evidence file
- server/index.js

Status: DONE

---

## Step 7: API response and error handling
### Requirement
Proper status codes and clean response behavior.

### Implemented
- Controllers return 200/201/400/404/500 as needed.
- Standard success/error fields included:
  - success true/false
  - data and legacy keys (project/projects/user/users/request/requests) for compatibility
- Global error middleware returns:
  - success false
  - error message

### Evidence files
- server/controllers/project.controller.js
- server/controllers/user.controller.js
- server/controllers/request.controller.js
- server/index.js

Status: DONE

---

## Step 8: Production compatibility stabilization
### Requirement
Final pass for frontend compatibility and missing endpoints.

### Implemented
- Added missing endpoints:
  - GET all users
  - DELETE request
- Added query filtering:
  - Projects by owner
  - Requests by to/from/projectId
- Fixed request status mismatch by including declined in enum.
- Added safe SSE endpoint:
  - /invites/stream/:username

### Evidence files
- server/models/Request.js
- server/controllers/project.controller.js
- server/controllers/request.controller.js
- server/controllers/user.controller.js
- server/index.js

Status: DONE

---

## 5. Final endpoint list

## Health
- GET /health

## SSE safe endpoint
- GET /invites/stream/:username

## Project routes
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id

## User routes
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id

## Request routes
- GET /api/requests
- POST /api/requests
- PUT /api/requests/:id
- DELETE /api/requests/:id

## Compatibility routes (same handlers)
- /projects, /users, /requests equivalents are also active.

---

## 6. How we achieved this (implementation approach)

1. Created clean DB bootstrap in config and moved all persistence to MongoDB.
2. Defined schemas first, then built controller logic around model operations.
3. Mounted routes in index.js after middleware setup.
4. Added strict input checks where required to reduce invalid writes.
5. Added populate in project and request reads for richer frontend payloads.
6. Added compatibility endpoints to avoid breaking existing frontend calls.
7. Added query filtering to align backend with frontend startup sync behavior.
8. Added SSE fallback endpoint so EventSource does not fail with 404.
9. Verified using runtime checks on health and API endpoints.

---

## 7. Viva ready Q and A

## Q1. Why did you migrate from JSON files to MongoDB?
A: JSON files are not suitable for concurrent multi-user production writes, have no schema validation, and scale poorly. MongoDB with Mongoose gives schema validation, indexing, relations via refs, and reliable CRUD operations.

## Q2. Why use MVC architecture?
A: MVC separates concerns: routes map URLs, controllers hold business logic, models hold schema/data rules. This improves maintainability, testability, and teamwork.

## Q3. Where is DB connection handled and why separately?
A: In server/config/db.js. Keeping DB setup separate improves modularity and allows cleaner startup flow and error handling.

## Q4. How do you ensure app does not start with broken DB?
A: connectDB catches errors and exits with process.exit(1). This fail-fast behavior avoids running a partially broken backend.

## Q5. How are project-owner and member relations represented?
A: In server/models/Project.js using ObjectId refs to User for owner and members.

## Q6. What is populate and where used?
A: Populate replaces ObjectId refs with selected related fields from referenced documents. Used in project and request read operations.

## Q7. Why select only name/email in populate?
A: To return essential relation data while reducing payload size and preventing unnecessary exposure.

## Q8. How did you handle frontend route mismatch?
A: Mounted both prefixed and non-prefixed routes in server/index.js, so old and new frontend paths work.

## Q9. Why add GET /users and DELETE /requests/:id?
A: Frontend needed these operations for list and remove behavior; missing endpoints created functional gaps.

## Q10. What was the declined vs rejected bug?
A: Frontend sent status declined but Request schema enum did not allow it earlier. Enum now includes declined to match frontend behavior.

## Q11. How did you support query-based filtering?
A: getProjects reads owner query; getRequests reads to/from/projectId query; builds filter object and passes it to find(filter).

## Q12. Why keep old response keys with data?
A: For backward compatibility with frontend code expecting keys like projects/request/user while also standardizing around success/data.

## Q13. How is input validation handled?
A: Required fields are checked in controller methods before DB operations, returning 400 on invalid input.

## Q14. Why did updateUser restrict fields?
A: Using allowedFields prevents unexpected updates and improves security by whitelisting editable properties.

## Q15. How do you avoid exposing passwords?
A: User read/update responses use select('-password').

## Q16. What status codes are used and why?
A:
- 200 for successful reads/updates/deletes
- 201 for creates
- 400 for invalid request input
- 404 for not found
- 500 for server errors

## Q17. What does the global error middleware do?
A: Catches unhandled errors and returns a uniform JSON error payload with success false and error message.

## Q18. Why add /health endpoint?
A: Used for monitoring and quick server availability checks.

## Q19. Why add SSE safe endpoint?
A: Frontend creates an EventSource connection; safe endpoint avoids 404 failures and keeps connection contract valid.

## Q20. What are production risks still outside this code task?
A: Secret rotation and hardening, auth policy, rate limiting, logging/monitoring integration, and deployment configs.

## Q21. How to explain run failure EADDRINUSE in viva?
A: It means another process already occupies the same port. Solution: kill listener on port 3001 and restart one clean server instance.

## Q22. How to explain Atlas connection failure due IP?
A: Atlas allows only whitelisted IPs. Add current IP or allow broad range (0.0.0.0/0 for development only).

## Q23. How do you prove work is complete quickly in viva?
A: Show file map, endpoint list, and run health + one CRUD + one filtered query + one declined status update.

---

## 8. Quick demo script for viva

1. Start backend
- npm run server (from DEVCONNECT)

2. Health check
- GET /health returns status ok

3. Projects
- GET /api/projects
- GET /api/projects?owner=<userId>

4. Requests
- POST /api/requests with pending
- PUT /api/requests/:id with declined
- GET /api/requests?to=<id>&from=<id>&projectId=<id>
- DELETE /api/requests/:id

5. Users
- GET /api/users
- GET /api/users/:id

6. Compatibility proof
- GET /projects, /users, /requests all respond via same handlers

---

## 9. Final conclusion
Person 1 backend objectives are implemented and stabilized:
- MongoDB + Mongoose MVC refactor complete
- Required models/controllers/routes complete
- Frontend compatibility and missing endpoint gaps resolved
- Query filters and status mismatch fixed
- SSE safety and global error consistency added

This backend is ready for demonstration and viva explanation with clear file-level evidence.
