## Create a review (student)

### POST /api/reviews

```json
{
  "userId": 2,
  "courseId": 1,
  "rating": 4.5,
  "comment": "Excellent course! Very comprehensive."
}
```

## Get reviews for a course (public)

### GET /api/reviews/course?courseId=1&page=1&limit=10&sortBy=rating&sortOrder=desc

## Get a specific review by ID

### GET /api/reviews/5

## Get my review for a course (student)

### GET /api/reviews/me/course/1

## Get reviews by user (admin/instructor/self)

### GET /api/reviews/user?userId=2&page=1&limit=5

## Get a specific user's review for a course

### GET /api/reviews/user/2/course/1

## Update a review (owner or admin)

### PATCH /api/reviews/5

```json
{
  "rating": 5.0,
  "comment": "Even better after finishing it!"
}
```

## Delete a review (owner or admin)

### DELETE /api/reviews/5

