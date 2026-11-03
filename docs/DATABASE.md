
# Database Documentation

## Database

PostgreSQL

## ORM

Prisma 7

## Main Models

### User
Stores registered user information.

Fields:
- id
- name
- email
- password
- createdAt
- updatedAt

### Project
Stores project information.

Fields:
- id
- name
- description
- ownerId
- createdAt
- updatedAt

### ProjectMember
Manages project membership and roles.

Fields:
- id
- projectId
- userId
- role
- joinedAt

### Task
Stores project tasks.

Fields:
- id
- title
- description
- status
- priority
- dueDate
- projectId
- createdById
- assignedToId
- createdAt
- updatedAt

## Relationships

- One User can own multiple Projects.
- One User can join multiple Projects.
- One Project can have multiple Members.
- One Project can contain multiple Tasks.
- One User can create multiple Tasks.
- One User can be assigned multiple Tasks.

## Enumerations

### ProjectRole
- ADMIN
- MEMBER

### TaskStatus
- TODO
- IN_PROGRESS
- COMPLETED

### TaskPriority
- LOW
- MEDIUM
- HIGH

## Constraints

- User email must be unique.
- A user can join a project only once.
- Project membership uses a composite unique constraint on projectId and userId.
- Tasks belong to an existing project.
- Task creator must reference an existing user.
- Assigned user must be a project member.
