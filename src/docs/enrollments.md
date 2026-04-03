## Create an enrollment (student self-enroll)
### POST /api/enrollments

```json
{
  "userId": 2,
  "courseId": 1
}
```
## Get my enrollments (student)
### GET /api/enrollments/me?page=1&limit=10&status=active

## Get all enrollments (instructor/admin) with filters
### GET /api/enrollments?courseId=1&status=active&page=1&limit=20

## Get enrollment by ID
### GET /api/enrollments/5

## Update enrollment status (instructor/admin)
### PATCH /api/enrollments/5

```json
{
  "status": "completed",
  "completedAt": "2025-04-10T14:30:00Z"
}
```
## Complete enrollment (student)
### PATCH /api/enrollments/5/complete
(no body)

## Delete enrollment (admin/instructor)
### DELETE /api/enrollments/5

