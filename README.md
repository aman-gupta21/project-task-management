
# Project & Task Management REST API

A RESTful backend application built using Node.js, Express.js, PostgreSQL and Prisma 7 to manage projects, team members and tasks.

## Overview

The Project & Task Management API allows registered users to create projects, invite team members, assign tasks, update task statuses and monitor project progress through dashboard summaries.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| Prisma 7 | ORM and database management |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet | Security headers |
| Morgan | HTTP request logging |
| Postman | API testing |

## Features

- User registration and login.
- JWT-based authentication.
- Secure password hashing.
- Project creation, updating and deletion.
- Project member management.
- ADMIN and MEMBER roles.
- Task creation and assignment.
- Task status management.
- Task priority management.
- Task deadlines.
- Task filtering and pagination.
- Dashboard statistics.
- Project-wise task summaries.
- Member-wise task summaries.
- Centralized error handling.
- API rate limiting.

## Project Architecture

```text
project-task-management/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validate.middleware.js
│   │   └── rateLimit.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── task.service.js
│   │   └── dashboard.service.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── apiResponse.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd project-task-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management"
JWT_SECRET="YOUR_SECURE_SECRET"
JWT_EXPIRES_IN="1d"
```

### 4. Configure PostgreSQL

Create a PostgreSQL database named:

```sql
CREATE DATABASE project_management;
```

Make sure your DATABASE_URL points to the correct database.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run database migrations

```bash
npx prisma migrate deploy
```

For a fresh local development setup without existing migrations, use:

```bash
npx prisma migrate dev --name init
```

### 7. Start the development server

```bash
npm run dev
```

Server:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## API Endpoints

All protected endpoints require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/projects | Create project |
| GET | /api/projects | Get my projects |
| GET | /api/projects/:id | Get project details |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

### Project Members

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/projects/:id/members | Add member |
| GET | /api/projects/:id/members | Get members |
| DELETE | /api/projects/:id/members/:userId | Remove member |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/tasks/projects/:id/tasks | Create task |
| GET | /api/tasks/projects/:id/tasks | Get project tasks |
| GET | /api/tasks/:id | Get task details |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Update task status |
| DELETE | /api/tasks/:id | Delete task |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/summary | Overall summary |
| GET | /api/dashboard/projects/:id/summary | Project summary |

## Task Status

- TODO
- IN_PROGRESS
- COMPLETED

## Task Priority

- LOW
- MEDIUM
- HIGH

## User Roles

| Role | Permissions |
|---|---|
| ADMIN | Manage project, members and tasks |
| MEMBER | View project and participate in assigned tasks |

Task-level permissions also apply to creators and assignees.

## Dashboard Statistics

The dashboard provides:

- Total projects and tasks.
- Task status distribution.
- Priority distribution.
- Overdue task count.
- Task completion percentage.
- Member-wise task allocation.

## Security

- JWT authentication.
- bcrypt password hashing.
- Zod request validation.
- Helmet security headers.
- Authentication rate limiting.
- Role-based authorization.
- Prisma database access.

## API Testing

All endpoints can be tested using Postman. Import the collection at
[`docs/postman/project-task-management.postman_collection.json`](docs/postman/project-task-management.postman_collection.json).
The login request saves its JWT as the collection variable `token`, which is
used by authenticated requests.

GitHub Actions runs the collection on pushes and pull requests targeting
`main`. Configure the `API_BASE_URL` repository secret under **Settings →
Secrets and variables → Actions** with the root URL of the deployed API (for
example, `https://api.example.com`, without a trailing slash or `/api`).
The collection uses this value for its request URLs. The deployed API and its
database must be available to the GitHub-hosted runner, and the collection's
test account and referenced test data must exist there; `localhost` on your
computer is not accessible to the runner.

## Future Improvements

- Automated unit and integration tests.
- Email notifications.
- Task comments and attachments.
- Activity logs.
- Real-time task updates.
- Docker deployment.
- CI/CD integration.

## Author

Aman Gupta

GitHub: https://github.com/aman-gupta21/

LinkedIn: Add your LinkedIn profile URL.

## License

This project is available under the MIT License.
