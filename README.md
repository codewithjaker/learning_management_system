# Learning Management API

A comprehensive REST API for managing software products, built with Express.js, TypeScript, Drizzle ORM, and Neon PostgreSQL.

## Features

- **Complete CRUD Operations** for software products, specifications, features, and requirements
- **TypeScript Support** with full type safety
- **Drizzle ORM** for database operations with Neon PostgreSQL
- **Zod Validation** for request validation
- **RESTful API Design** with proper HTTP methods and status codes
- **Pagination & Filtering** for all list endpoints
- **Error Handling** with meaningful error messages
- **Authentication Ready** (can be extended)
- **CORS Support** for cross-origin requests
- **Security Headers** with Helmet
- **Request Logging** with Morgan

## Tech Stack

- **Runtime:** Node.js (>=18.0.0)
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Drizzle ORM
- **Database:** Neon PostgreSQL
- **Validation:** Zod
- **Security:** Helmet, CORS

## Prerequisites

- Node.js (>=18.0.0)
- npm (>=9.0.0) or yarn
- Neon PostgreSQL database account

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/software-products-api.git
   cd software-products-api


### 🔐 Auth Routes
```js
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/logout-all
POST /auth/refresh-token

POST /auth/forgot-password
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/reset-password

POST /auth/change-password

POST /auth/verify-email
POST /auth/resend-verification
```

### 👤 User Routes
```js
GET    /users/me
PUT    /users/me
DELETE /users/me
```

### 🔑 Optional (Advanced / Senior Level)
```js
GET    /auth/sessions          → list active sessions
DELETE /auth/sessions/:id     → revoke specific session
```