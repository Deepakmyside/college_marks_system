# College Marks System

A backend system for managing college academic marks, students, subjects, and semester-wise academic records.

The system is designed to eliminate manual semester updates by deriving a student's current semester from their **batch + academic period** while preserving historical marks data.

## What We're Building

The system supports the complete teacher marks workflow:

```text
Branch
  ↓
Subjects
  ↓
Semester + Section
  ↓
Students
  ↓
Marks Submission
  ↓
Historical Academic Records

The long-term goal is a college-wide platform for:

Teacher marks submission
Student academic records
HOD performance overview
Subject-wise and student-wise analysis
Semester/batch based historical data
Reports and Excel exports
Key Architecture
Automatic Semester Progression

A student's semester is not stored permanently on the Student model.

Instead:

Student Batch + Academic Period
              ↓
       Current Semester

For example:

2024-28 + 2026-27 ODD  → Semester 5
2025-29 + 2026-27 ODD  → Semester 3
2025-29 + 2026-27 EVEN → Semester 4

Historical MarkSession records store the semester and batch applicable at the time of submission, so previous academic records remain unchanged.

Tech Stack
Node.js
Express.js
PostgreSQL
Prisma ORM
REST APIs
Postman
Git / GitHub
Core Models
User
Branch
Semester
Student
Subject
AcademicPeriod
MarkSession
Assessment
Relationships
Branch
 ├── Students
 └── Subjects

Semester
 ├── Subjects
 └── MarkSessions

Student
 └── Assessments

MarkSession
 └── Assessments

AcademicPeriod
 └── Determines current semester
API
Students
GET /api/students

Fetches students based on branch, semester and section while validating their current semester from batch and academic period.

Subjects
GET /api/subjects

Fetches subjects for a branch and semester.

Marks
POST /api/marks

Creates a marks submission session and its student assessments.

GET /api/marks

Retrieves previously submitted marks.

Project Structure
college_marks_system/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── generated/
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
Setup
git clone <repository-url>
cd college_marks_system
npm install

Create .env:

DATABASE_URL="your-postgresql-connection-string"

Then:

npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

Server runs on:

http://localhost:3000
Current Progress
 Database architecture
 PostgreSQL + Prisma setup
 Seed data
 Student API
 Subject API
 Academic period system
 Automatic semester progression
 Marks submission API
 Historical MarkSession records
 Authentication & authorization
 HOD dashboard APIs
 Performance analytics
 Excel reports
 Frontend
Status

🚧 Actively under development