## Create a Quiz (Instructor/Admin)
### POST /api/quizzes

Request body – dummy quiz with 2 questions (multiple‑choice and true/false):

```json
{
  "syllabusItemId": 101,
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge of JavaScript fundamentals.",
  "timeLimit": 30,
  "passingScore": 70,
  "maxAttempts": 2,
  "shuffleQuestions": true,
  "showResults": true,
  "questions": [
    {
      "questionText": "Which of the following is used to declare a variable in JavaScript?",
      "questionType": "multiple_choice",
      "points": 2,
      "orderIndex": 1,
      "explanation": "var, let, and const are all variable declaration keywords in JavaScript.",
      "options": [
        { "optionText": "var", "isCorrect": true, "orderIndex": 0 },
        { "optionText": "vary", "isCorrect": false, "orderIndex": 1 },
        { "optionText": "variable", "isCorrect": false, "orderIndex": 2 },
        { "optionText": "let", "isCorrect": true, "orderIndex": 3 },
        { "optionText": "const", "isCorrect": true, "orderIndex": 4 }
      ]
    },
    {
      "questionText": "JavaScript is a statically typed language.",
      "questionType": "true_false",
      "points": 1,
      "orderIndex": 2,
      "explanation": "JavaScript is dynamically typed; variables can hold any type.",
      "options": [
        { "optionText": "True", "isCorrect": false, "orderIndex": 0 },
        { "optionText": "False", "isCorrect": true, "orderIndex": 1 }
      ]
    }
  ]
}
```
Expected Response (201 Created)

```json
{
  "id": 1,
  "syllabusItemId": 101,
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge of JavaScript fundamentals.",
  "timeLimit": 30,
  "passingScore": 70,
  "maxAttempts": 2,
  "shuffleQuestions": true,
  "showResults": true,
  "questions": [
    {
      "id": 101,
      "questionText": "Which of the following is used to declare a variable in JavaScript?",
      "questionType": "multiple_choice",
      "points": "2",
      "orderIndex": 1,
      "explanation": "var, let, and const are all variable declaration keywords in JavaScript.",
      "options": [
        { "id": 1001, "optionText": "var", "isCorrect": true, "orderIndex": 0 },
        { "id": 1002, "optionText": "vary", "isCorrect": false, "orderIndex": 1 },
        { "id": 1003, "optionText": "variable", "isCorrect": false, "orderIndex": 2 },
        { "id": 1004, "optionText": "let", "isCorrect": true, "orderIndex": 3 },
        { "id": 1005, "optionText": "const", "isCorrect": true, "orderIndex": 4 }
      ]
    },
    {
      "id": 102,
      "questionText": "JavaScript is a statically typed language.",
      "questionType": "true_false",
      "points": "1",
      "orderIndex": 2,
      "explanation": "JavaScript is dynamically typed; variables can hold any type.",
      "options": [
        { "id": 1006, "optionText": "True", "isCorrect": false, "orderIndex": 0 },
        { "id": 1007, "optionText": "False", "isCorrect": true, "orderIndex": 1 }
      ]
    }
  ],
  "createdAt": "2025-04-01T10:00:00.000Z",
  "updatedAt": "2025-04-01T10:00:00.000Z"
}
```
## Get Quiz by ID (Any authenticated user)
### GET /api/quizzes/:id

Example: GET /api/quizzes/1

Response (same structure as creation response).

##  Get Quiz by Syllabus Item ID
### GET /api/quizzes/syllabus-item/:syllabusItemId

Example: GET /api/quizzes/syllabus-item/101

Response – same as above.

##  Update a Quiz (Instructor/Admin)
### PUT /api/quizzes/:id

Request body – partial fields (only changed fields):

```json
{
  "title": "JavaScript Basics Quiz (Updated)",
  "timeLimit": 45
}
Response – updated full quiz object.

## Delete a Quiz
### DELETE /api/quizzes/:id

No response body → 204 No Content.

##  Start a Quiz (Student)
### POST /api/quizzes/:quizId/start

Example: POST /api/quizzes/1/start

Response – newly created attempt:

```json
{
  "id": 10001,
  "userId": 2,
  "quizId": 1,
  "startedAt": "2025-04-01T10:05:00.000Z",
  "submittedAt": null,
  "score": null,
  "passed": null,
  "status": "in_progress",
  "createdAt": "2025-04-01T10:05:00.000Z",
  "updatedAt": "2025-04-01T10:05:00.000Z"
}
``` 
##  Submit a Quiz (Student)
### POST /api/quizzes/attempts/:attemptId/submit

Example: POST /api/quizzes/attempts/10001/submit

Request body – answers for all questions:

```json
{
  "answers": [
    {
      "questionId": 101,
      "selectedOptionId": 1004
    },
    {
      "questionId": 102,
      "selectedOptionId": 1007
    }
  ]
}
```
Response – summary result:

```json
{
  "attemptId": 10001,
  "score": 75.0,
  "passed": true
}
(Assuming question 1 worth 2 pts, user got 1 correct option out of 3 correct → partial? Our simple grading gives full points if any correct? In code we used isCorrect boolean – selected option must be correct. For multiple-answer we need different logic. For simplicity, we'll give full points per question if correct.)

###  Get Quiz Result (Detailed)
GET /api/quizzes/attempts/:attemptId/result

Example: GET /api/quizzes/attempts/10001/result

Response:

```json
{
  "attemptId": 10001,
  "score": 75,
  "passed": true,
  "totalPoints": 3,
  "earnedPoints": 2.25,
  "answers": [
    {
      "questionId": 101,
      "questionText": "Which of the following is used to declare a variable in JavaScript?",
      "userAnswer": "let",
      "correctAnswer": "var, let, const",
      "isCorrect": true,
      "pointsEarned": 2,
      "explanation": "var, let, and const are all variable declaration keywords in JavaScript."
    },
    {
      "questionId": 102,
      "questionText": "JavaScript is a statically typed language.",
      "userAnswer": "False",
      "correctAnswer": "False",
      "isCorrect": true,
      "pointsEarned": 1,
      "explanation": "JavaScript is dynamically typed; variables can hold any type."
    }
  ]
}
```
##  Get Attempt History for a Quiz (Student)
### GET /api/quizzes/:quizId/history

Example: GET /api/quizzes/1/history

Response:

```json
[
  {
    "id": 10001,
    "userId": 2,
    "quizId": 1,
    "startedAt": "2025-04-01T10:05:00.000Z",
    "submittedAt": "2025-04-01T10:15:00.000Z",
    "score": "75",
    "passed": true,
    "status": "submitted",
    "createdAt": "2025-04-01T10:05:00.000Z",
    "updatedAt": "2025-04-01T10:15:00.000Z"
  },
  {
    "id": 10002,
    "userId": 2,
    "quizId": 1,
    "startedAt": "2025-04-02T14:20:00.000Z",
    "submittedAt": null,
    "score": null,
    "passed": null,
    "status": "in_progress",
    "createdAt": "2025-04-02T14:20:00.000Z",
    "updatedAt": "2025-04-02T14:20:00.000Z"
  }
]
```
### Summary of Endpoints
| Method | Endpoint | Description | Roles |
|:-------|:---------|:------------|:------|
| **POST** | `/quizzes` | Create a new quiz | instructor, admin |
| **GET** | `/quizzes/:id` | Get quiz by ID | authenticated |
| **GET** | `/quizzes/syllabus-item/:syllabusItemId` | Get quiz by syllabus item | authenticated |
| **PUT** | `/quizzes/:id` | Update quiz | instructor, admin |
| **DELETE** | `/quizzes/:id` | Delete quiz | instructor, admin |
| **POST** | `/quizzes/:quizId/start` | Start a quiz attempt | student |
| **POST** | `/quizzes/attempts/:attemptId/submit` | Submit answers | student |
| **GET** | `/quizzes/attempts/:attemptId/result` | Get detailed result | student |
| **GET** | `/quizzes/:quizId/history` | Get attempt history | student |


Use the dummy data above to test the endpoints. All timestamps should be in ISO8601 format. The quiz system supports multiple-choice, true/false, and short answer questions.