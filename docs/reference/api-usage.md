# API Usage Guide

This guide shows how to interact with the NestJS skeleton API.

## Starting the Server

```bash
# Install dependencies
pnpm install

# Set up environment variables (copy from .env.example)
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development server
pnpm start:dev
```

Server runs on `http://localhost:3000` by default.

---

## Authentication

### Register a New User

```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):

```json
{ "id": "usr_abc123xyz", "name": "John Doe", "email": "john@example.com", "createdAt": "2026-01-06T13:45:00.000Z" }
```

### Login

```bash
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "usr_abc123xyz", "name": "John Doe", "email": "john@example.com" }
}
```

### Using the JWT Token

Include the token in subsequent requests:

```bash
GET /protected-route
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Responses

All errors follow a standard format:

```json
{ "statusCode": 401, "message": "Invalid credentials", "error": "Unauthorized" }
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Example Requests

### Using cURL

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# With authentication
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Create user
const response = await fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe', email: 'john@example.com', password: 'SecurePassword123!' }),
});

const user = await response.json();

// Login
const loginResponse = await fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com', password: 'SecurePassword123!' }),
});

const { token, user: loggedInUser } = await loginResponse.json();

// Authenticated request
const protectedResponse = await fetch('http://localhost:3000/protected', {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## Environment Variables

Required variables in `.env`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nest_skeleton

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Encryption
SALT_ROUND=10
PII_SECRET=pii-secret
PII_ACTIVE=true
HMAC_SECRET=hmac-secret
MASTER_KEY=master-key
DERIVE_KEY=derive-key

# Server
PORT=3000
NODE_ENV=development
```

---

## Available Endpoints

### Users Module

| Method | Endpoint       | Description     | Auth Required |
| ------ | -------------- | --------------- | ------------- |
| POST   | `/users`       | Create new user | No            |
| POST   | `/users/login` | Login           | No            |

---

## Testing

For testing, you can use:

- **cURL** (command line)
- **Postman** (GUI)
- **Insomnia** (GUI)
- **HTTPie** (command line)

---

## Next Steps

- [Creating a Module](../tutorials/creating-a-module.md) - Add new endpoints
- [CQRS Pattern](../guides/cqrs-pattern.md) - Understand the pattern
