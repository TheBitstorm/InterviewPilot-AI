# InterviewPilot AI

InterviewPilot AI is a production-ready mock interview and placement preparation platform. It generates role-tailored technical, behavioral, and HR interview questions using Google Gemini AI, incorporates parsed resume context, provides real-time per-question evaluations, and generates comprehensive post-interview performance reports and actionable learning roadmaps.

---

## Key Features

- **Personalized AI Question Generation**: Dynamically crafts interview questions based on the candidate's target role, selected difficulty, interview type, and parsed resume background.
- **In-Memory Resume Parsing**: Parses uploaded PDF resumes into structured text using `pdf-parse`, stores the parsed text in PostgreSQL, and immediately removes temporary files from disk.
- **Interactive Interview Session**: Step-by-step interview experience featuring per-question timers, live answer drafting, single-job concurrency guards, and client-side safety timeout handling.
- **Real-Time Answer Evaluation**: Evaluates candidate answers using Gemini AI, providing scores (0–10), correctness breakdown, communication feedback, and concrete improvement suggestions.
- **Performance Analytics Reports**: Generates detailed session reports with overall score, topic-by-topic ratings, strengths, weaknesses, and hiring recommendations.
- **Personalized Learning Roadmaps**: Automatically builds structured learning roadmaps with prioritized topics, descriptions, and learning resources based on identified performance gaps.
- **Interview History & Dashboard**: Tracks previous interview sessions, completed reports, average performance scores, and active resume selection.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Build Tool**: Vite 8.2.1
- **Routing**: React Router v7 (`react-router-dom` 7.18.2) with Single-Page Application (SPA) layout
- **State Management**: Zustand 5.0.15 for client authentication state
- **HTTP Client**: Axios 1.19.0 with request/response interceptors for JWT injection and 401 handling
- **Styling**: Vanilla CSS design system with custom CSS variables and glassmorphism styling

### Backend
- **Framework**: Express 5.2.1 on Node.js
- **Environment Validation**: Zod 3.25.74 for schema and environment variable validation on boot
- **File Uploads**: Multer 2.0.1 disk storage for temporary PDF handling
- **PDF Extraction**: `pdf-parse` 2.4.5 for in-memory text parsing
- **Security & Auth**: `bcryptjs` 3.0.3 (cost factor 12) for password hashing, `jsonwebtoken` 9.0.3 for JWT signing/verification, and `cors` 2.8.6

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma 7.9.1 with `@prisma/adapter-pg` and `pg` 8.23.0 connection pooling
- **Configuration**: Prisma 7 `prisma.config.ts` configuration format

### AI Integration
- **Provider**: Google Gemini AI accessed through OpenAI SDK compatibility layer (`openai` 4.104.0)
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Default Model**: `gemini-3.5-flash-lite` (with automatic fallback to `gemini-3.5-flash`, `gemini-flash-lite-latest`, and `gemini-3.1-flash-lite`)

---

## Application Workflow

```
1. Authentication
   ├── Register (/register) -> Password hashed with bcrypt -> JWT issued
   └── Login (/login) -> Credentials verified -> JWT stored in localStorage

2. Resume Management (/resume)
   ├── Upload PDF (max 5 MB)
   ├── In-memory text extraction -> temporary upload deleted immediately
   └── Parsed text persisted in PostgreSQL -> marked active

3. Interview Setup (/interview/setup)
   ├── Select Active Resume
   ├── Choose Target Role, Interview Type (Technical, Behavioral, HR)
   ├── Select Difficulty (Easy, Medium, Hard) & Question Count (3 to 10)
   └── Session created with status: "pending"

4. Interactive Interview Session (/interview/:id)
   ├── AI Question Generation triggered -> Gemini generates questions
   ├── Questions persisted -> Session status transitions to "active"
   ├── Question-by-question view with timer and answer drafting
   └── Answer Submission -> Gemini evaluates answer -> Feedback stored

5. Report & Analytics (/report/:id)
   ├── Comprehensive report generated upon session completion
   ├── Overall score, topic breakdown, strengths, weaknesses, recommendations
   └── Trigger Learning Roadmap generation

6. Personalized Roadmap (/roadmap/:id)
   ├── Prioritized learning topics (High, Medium, Low)
   ├── Topic descriptions and curated learning resources
   └── Interactive topic status toggling (Not Started, In Progress, Done)

7. Dashboard & History (/dashboard, /interview/history)
   └── View interview metrics, average scores, and past session reports
```

---

## Project Folder Structure

```
InterviewPilot-AI/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── assets/              # Static media assets
│   │   ├── components/          # Reusable UI components (Sidebar, Logo, Layout)
│   │   ├── pages/               # Page components
│   │   │   ├── auth/            # LoginPage, RegisterPage
│   │   │   ├── interview/       # InterviewSetupPage, InterviewSessionPage, InterviewHistoryPage
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ReportPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   └── RoadmapPage.jsx
│   │   ├── routes/              # AppRouter and ProtectedRoute wrappers
│   │   ├── services/            # Axios API service layer (auth, interview, report, resume, roadmap)
│   │   ├── store/               # Zustand auth store
│   │   └── utils/               # Formatting and constant utilities
│   ├── package.json
│   ├── vercel.json              # Vercel SPA routing rewrites
│   └── vite.config.js
│
├── server/                      # Backend API Server (Express + Prisma)
│   ├── prisma/
│   │   ├── migrations/          # Committed Prisma SQL migration history
│   │   └── schema.prisma        # Database models, relations, and enums
│   ├── src/
│   │   ├── ai/                  # Gemini AI abstraction and prompt builders
│   │   ├── config/              # Prisma DB client (pg pool) and Zod env validator
│   │   ├── middleware/          # JWT authentication, error handling, validation
│   │   ├── modules/             # Business logic modules
│   │   │   ├── auth/            # Auth controller, service, routes, validators
│   │   │   ├── interview/       # Session & question lifecycle
│   │   │   ├── report/          # Report generation & analytics
│   │   │   ├── resume/          # Resume upload, parsing, deletion
│   │   │   ├── roadmap/         # Learning roadmap & topic tracking
│   │   │   └── user/            # User profile endpoints
│   │   ├── utils/               # AppError, apiResponse, jwtHelper
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP server bootstrap and graceful shutdown
│   ├── uploads/                 # Ephemeral upload folder with .gitkeep
│   ├── package.json
│   ├── prisma.config.ts         # Prisma 7 database configuration
│   └── .env.example             # Documented server environment variables
│
├── .gitignore                   # Root Git ignore rules
└── README.md                    # Project documentation
```

---

## Prerequisites

Before running the application locally, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local PostgreSQL instance or remote connection (e.g., Render, Supabase, Neon)
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

## Environment Variable Setup

### 1. Server Configuration (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```bash
cd server
cp .env.example .env
```

Configure the following variables in `server/.env`:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Environment mode | `development` (or `production`) |
| `PORT` | No | Server port (default: `5000`) | `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@localhost:5432/interviewpilot` |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 16 chars) | `your-secure-random-jwt-secret-string` |
| `JWT_EXPIRES_IN`| No | Token expiry duration | `7d` |
| `CLIENT_URL` | Yes | Frontend URL for CORS allowance | `http://localhost:5173` |
| `GEMINI_API_KEY`| Yes | Google Gemini API key | `your-gemini-api-key` |
| `GEMINI_MODEL` | No | Target model (default: `gemini-3.5-flash-lite`) | `gemini-3.5-flash-lite` |
| `OPENAI_API_KEY`| No | Optional fallback key | `sk-...` |

### 2. Client Configuration (`client/.env`)

The frontend defaults to `/api/v1` (proxied by Vite to `http://localhost:5000` in development). To configure explicitly:

```bash
cd client
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
```

---

## Database Setup & Prisma Migrations

1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Generate the Prisma Client:
   ```bash
   npm run db:generate
   ```

3. Run migrations to initialize the database schema:
   ```bash
   npm run db:migrate
   ```
   *(For production deployment, use `npx prisma migrate deploy`)*

4. Optional database utility commands:
   - Open Prisma Studio GUI:
     ```bash
     npm run db:studio
     ```
   - Push schema changes without migration history (prototyping only):
     ```bash
     npm run db:push
     ```

---

## Running the Application Locally

### 1. Start the Backend API Server
In the `server` directory:
```bash
npm run dev
```
The server will start on `http://localhost:5000`. You can verify health at:
```
http://localhost:5000/api/health
```

### 2. Start the Frontend Client
In a separate terminal, navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`. Open this URL in your browser.

---

## Build and Verification Commands

### Frontend Build
To verify the production build of the client:
```bash
cd client
npm run build
```
Build output is generated in `client/dist/`.

### Backend Build / Prisma Generation
To generate the Prisma Client for production:
```bash
cd server
npm run build
```
This executes `prisma generate` and compiles client types into `node_modules/@prisma/client`.

### API Health Check
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "InterviewPilot AI server is running.",
  "timestamp": "2026-10-27T...",
  "environment": "development"
}
```

---

## Deployment Notes

### Backend Deployment (Render)
1. **Service Type**: Web Service connected to your GitHub repository.
2. **Root Directory**: `server`
3. **Runtime**: Node
4. **Build Command**: `npm run build` *(executes `prisma generate`)*
5. **Start Command**: `npm run start` *(executes `node src/server.js`)*
6. **Required Environment Variables** (set manually in the Render Dashboard):
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Hosted PostgreSQL connection URL (e.g., from Render PostgreSQL)
   - `JWT_SECRET`: Random 32+ character string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://<your-project>.vercel.app` without trailing slash)
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
7. **Database Migration Step**:
   Run the migration command in the Render Shell or as a Pre-Deploy command:
   ```bash
   npx prisma migrate deploy
   ```

### Frontend Deployment (Vercel)
1. **Framework Preset**: Vite
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **SPA Rewrites**: Handled automatically by the included `client/vercel.json`.
6. **Required Environment Variables** (set manually in the Vercel Dashboard):
   - `VITE_API_URL`: Your deployed Render backend URL (e.g., `https://<your-backend>.onrender.com/api/v1` without trailing slash).

---

## Security Notes

- **Never Commit Secrets**: Real `.env` files (`server/.env`, `client/.env`) are excluded by `.gitignore` and must never be committed to Git.
- **Isolated Credentials**: All database credentials, JWT secrets, and Gemini API keys reside exclusively on the server. The client bundle exposes only `VITE_API_URL`.
- **Ephemeral Storage**: PDF resume uploads are parsed in-memory and deleted from the local disk immediately via `fs.unlinkSync`.
- **Password Protection**: User passwords are encrypted using `bcryptjs` with salt round cost factor 12 prior to database insertion.
- **JWT Secret Enforcement**: Requires at least 16 characters (32+ characters recommended in production) strictly enforced by startup environment validation.
