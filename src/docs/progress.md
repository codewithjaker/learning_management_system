## Upsert progress (create or update)

### POST /api/progress

```json
{
  "userId": 2,
  "itemId": 5,
  "completed": true,
  "lastPosition": 300
}
```

If the record doesn't exist, it creates one; if it exists, it updates.

## Get my progress in a specific course (student)

### GET /api/progress/me/course/1?page=1&limit=20&sortBy=itemId&sortOrder=asc

## Get overall progress summary

### GET /api/progress/overview/2/1

Response example:

```json
{
  "completed": 15,
  "total": 30
}
```

## Get progress by user and course (instructor/admin)

### GET /api/progress?userId=2&courseId=1&page=1&limit=20

## Get progress by item (instructor/admin)

### GET /api/progress/by-item?itemId=5&page=1&limit=10

## Get specific progress record by ID

### GET /api/progress/10

## Update progress record by ID (rarely needed, mostly use upsert)

### PATCH /api/progress/10

```json
{
  "completed": true,
  "lastPosition": 450
}
```

## Delete progress record (admin only)

### DELETE /api/progress/10
