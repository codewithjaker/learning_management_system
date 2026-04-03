## Create a section

### POST /api/syllabus-sections

```json
{
  "courseId": 1,
  "title": "Introduction to Node.js",
  "orderIndex": 1
}
```

## Update a section

### PATCH /api/syllabus-sections/1

```json
{
  "title": "Getting Started with Node.js"
}
```

## List sections of a course

### GET /api/syllabus-sections?courseId=1&page=1&limit=10&sortBy=orderIndex&sortOrder=asc

## Get a section by ID

### GET /api/syllabus-sections/1

## Delete a section

### DELETE /api/syllabus-sections/1

## Create an item

### POST /api/syllabus-items

```json
{
  "sectionId": 1,
  "title": "What is Node.js?",
  "type": "video",
  "content": "https://example.com/video1.mp4",
  "duration": 600,
  "isFree": true,
  "orderIndex": 1
}
```

For a quiz:

```json
{
  "sectionId": 1,
  "title": "Node.js Basics Quiz",
  "type": "quiz",
  "content": "{\"questions\":[{\"question\":\"What is Node.js?\",\"options\":[\"A\",\"B\",\"C\"],\"answer\":\"A\"}]}",
  "duration": 600,
  "isFree": false,
  "orderIndex": 2
}
```

## Update an item

### PATCH /api/syllabus-items/1

```json
{
  "title": "Introduction to Node.js",
  "isFree": true
}
```

## List items of a section

### GET /api/syllabus-items?sectionId=1&page=1&limit=20&sortBy=orderIndex&sortOrder=asc

## Get an item by ID

### GET /api/syllabus-items/1

## Delete an item

### DELETE /api/syllabus-items/1
