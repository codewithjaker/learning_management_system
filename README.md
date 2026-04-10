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


### PROJECT STRUCTURE
```json
src/
├── db/
│ ├── index.ts # Database connection (drizzle + pool)
│ └── schema/ # All Drizzle table definitions
│ ├── index.ts # Re‑exports all schemas & relations
│ ├── enums.ts # PostgreSQL enums (user roles, item types, etc.)
│ ├── users.ts # users table
│ ├── categories.ts # categories table
│ ├── courses.ts # courses table
│ ├── syllabusSections.ts # syllabus sections (modules/chapters)
│ ├── syllabusItems.ts # syllabus items (lectures, quizzes, etc.)
│ ├── enrollments.ts # enrollments table (user ↔ course)
│ ├── progress.ts # user_item_progress (tracking)
│ ├── reviews.ts # course_reviews (ratings & comments)
│ ├── coupons.ts # coupons (discount codes)
│ ├── invoices.ts # invoices
│ ├── invoiceItems.ts # invoice line items
│ ├── payments.ts # payments (installments, etc.)
│ ├── payouts.ts # instructor payouts
│ ├── sessions.ts # active sessions (refresh tokens)
│ ├── verificationTokens.ts # email verification & password reset tokens
│ └── relations.ts # Drizzle relations between all tables
│
├── validations/ # Zod validation schemas for each entity
│ ├── index.ts # Re‑export all validation schemas
│ ├── auth.ts
│ ├── user.ts
│ ├── category.ts
│ ├── course.ts
│ ├── syllabusSection.ts
│ ├── syllabusItem.ts
│ ├── enrollment.ts
│ ├── progress.ts
│ ├── review.ts
│ ├── coupon.ts
│ ├── invoice.ts
│ ├── invoiceItem.ts
│ ├── payment.ts
│ └── payout.ts
│
├── services/ # Business logic & database queries
│ ├── index.ts # Re‑export all services
│ ├── auth.service.ts # Authentication logic (register, login, OTP, sessions)
│ ├── session.service.ts # Session CRUD (refresh tokens)
│ ├── user.service.ts # User CRUD (admins only) + profile management
│ ├── category.service.ts
│ ├── course.service.ts
│ ├── syllabusSection.service.ts
│ ├── syllabusItem.service.ts
│ ├── enrollment.service.ts
│ ├── progress.service.ts
│ ├── review.service.ts
│ ├── coupon.service.ts
│ ├── invoice.service.ts
│ ├── invoiceItem.service.ts
│ ├── payment.service.ts
│ └── payout.service.ts
│
├── controllers/ # Request handlers (Express)
│ ├── index.ts # Re‑export all controllers
│ ├── auth.controller.ts
│ ├── user.controller.ts
│ ├── category.controller.ts
│ ├── course.controller.ts
│ ├── syllabusSection.controller.ts
│ ├── syllabusItem.controller.ts
│ ├── enrollment.controller.ts
│ ├── progress.controller.ts
│ ├── review.controller.ts
│ ├── coupon.controller.ts
│ ├── invoice.controller.ts
│ ├── invoiceItem.controller.ts
│ ├── payment.controller.ts
│ └── payout.controller.ts
│
├── routes/ # Express route definitions
│ ├── index.ts # Combine all route modules
│ ├── auth.routes.ts
│ ├── user.routes.ts
│ ├── category.routes.ts
│ ├── course.routes.ts
│ ├── syllabusSection.routes.ts
│ ├── syllabusItem.routes.ts
│ ├── enrollment.routes.ts
│ ├── progress.routes.ts
│ ├── review.routes.ts
│ ├── coupon.routes.ts
│ ├── invoice.routes.ts
│ ├── invoiceItem.routes.ts
│ ├── payment.routes.ts
│ └── payout.routes.ts
│
├── middleware/ # Express middleware
│ ├── auth.ts # JWT authentication & role checks
│ ├── errorHandler.ts # Global error handler (Zod, API errors)
│ ├── validate.ts # Zod validation middleware
│ └── rateLimiter.ts # Optional rate limiting
│
├── utils/ # Helper functions & utilities
│ ├── errors.ts # Custom error classes (ApiError, NotFound, etc.)
│ ├── jwt.ts # JWT token generation & verification
│ ├── password.ts # Bcrypt password hashing & comparison
│ ├── email.ts # Nodemailer transporter & email templates
│ └── pagination.ts # Pagination helper (optional)
│
├── app.ts # Express app configuration (cors, helmet, json)
└── server.ts # Entry point (starts the server)
```