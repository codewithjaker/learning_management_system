## Create user (admin only)

### POST /api/users

```json
{
  "email": "jane.smith@example.com",
  "password": "pass456",
  "fullName": "Jane Smith",
  "bio": "Experienced web developer",
  "avatar": "https://example.com/avatar.jpg",
  "role": "instructor",
  "isActive": true
}
```

## Update user (admin only)

### PATCH /api/users/1

```json
{
  "fullName": "Jane S. Smith",
  "bio": "Senior web developer"
}
```

## Get all users with filters

### GET /api/users?page=1&limit=10&search=john&role=student&sortBy=fullName&sortOrder=asc

## Get user by ID

### GET /api/users/1

## Delete user

### DELETE /api/users/1

## Get user statistics

### GET /api/users/stats

## Get instructors

### GET /api/users/instructors
