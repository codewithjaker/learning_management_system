## Create course (instructor or admin)

### POST /api/courses

```json
{
  "title": "Mastering Node.js",
  "slug": "mastering-nodejs",
  "subtitle": "From zero to hero",
  "description": "Learn Node.js from scratch and build real-world applications.",
  "fullDescription": "This comprehensive course covers everything from the basics of Node.js to advanced topics like REST APIs, authentication, and deployment.",
  "image": "https://example.com/images/nodejs-course.jpg",
  "previewVideoUrl": "https://youtu.be/abc123",
  "level": "intermediate",
  "category": "Web Development",
  "tags": ["nodejs", "backend", "javascript"],
  "price": 49.99,
  "originalPrice": 99.99,
  "certification": "Node.js Professional Certificate",
  "requirements": ["Basic JavaScript", "Familiarity with npm"],
  "learningOutcomes": [
    "Build REST APIs",
    "Work with databases",
    "Deploy to production"
  ],
  "targetAudience": ["Backend developers", "JavaScript developers"],
  "language": "English",
  "courseProjects": ["E-commerce API", "Chat application"],
  "courseSoftware": ["Node.js", "Postman", "MongoDB"],
  "courseFeatures": ["Lifetime access", "Certificate of completion"],
  "instructorId": 5,
  "status": "draft"
}
```

## Update course (instructor of that course or admin)

### PATCH /api/courses/1

```json
{
  "price": 39.99,
  "subtitle": "Updated subtitle"
}
```

## Publish course

### PATCH /api/courses/1/publish (no body)

## Get all courses with filters

### GET /api/courses?page=1&limit=10&category=Web%20Development&level=intermediate&search=node&featured=true&sortBy=rating&sortOrder=desc

## Get course by slug

### GET /api/courses/slug/mastering-nodejs

## Get course by ID

### GET /api/courses/1

## Get courses by instructor

### GET /api/courses/instructor/5

## Delete course

### DELETE /api/courses/1

## Update course stats (admin only)

### PATCH /api/courses/1/stats

```json
{
  "rating": 4.8,
  "totalReviews": 120,
  "duration": 3600
}
```
