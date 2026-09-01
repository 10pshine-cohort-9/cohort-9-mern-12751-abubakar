# NoteSpace — MERN Notes Application

A full-stack note-taking web application built with MongoDB, Express 5, React 19, and Node.js. It features JWT-based authentication, a rich text editor, real-time search, tag filtering, dark/light theme switching, and JSON import/export capabilities.

**Live Demo:** [https://notespace.onrender.com](https://notespace.onrender.com)

---

## Features

### Authentication & User Management
- **User registration & login** with email and password.
- **Secure password hashing** using `bcryptjs` (with pre-save hooks and bcrypt byte-length validation).
- **JWT token-based authorization** stored client-side in `localStorage` with automatic token attachment on API requests and safe logout on 401 responses.
- **Profile page** displaying account details, initials avatar, and session management.

### Note Management
- **Create, Read, Edit, and Delete (CRUD)** notes with title, rich HTML content, and tags.
- **Rich text editing** powered by Quill (`react-quill-new`) for formatting headings, lists, links, bold, italics, and code snippets.
- **HTML sanitization** on the backend using `sanitize-html` to prevent cross-site scripting (XSS) attacks.
- **Dedicated reading view** (`/notes/:id`) for clean distraction-free viewing.

### Organization & Discovery
- **Live search** across note titles and content with client-side 300ms debouncing and regex-escaped queries on the backend.
- **Tag system** with automatic tag discovery and pill-based filtering.
- **Flexible sorting** by last updated, creation date, or alphabetically (A–Z / Z–A).

### Data Portability (Import & Export)
- **JSON export**: Download all notes or selectively picked notes as a dated JSON backup (`notes-export-YYYY-MM-DD.json`).
- **JSON import**: Restore notes with schema validation, format checking, and file size limits (up to 5 MB).

### User Experience & Design
- **Dark and Light mode** support with system preference detection, smooth transitions, and persistent storage.
- **Glassmorphic UI** styled with Tailwind CSS v4 and custom theme variables.
- **Responsive layout** suitable for mobile, tablet, and desktop screens.

---

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite 8
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 & custom CSS design tokens
- **Rich Text Editor:** `react-quill-new`
- **HTTP Client:** Axios
- **Testing:** Vitest, React Testing Library, jsdom

### Backend
- **Runtime:** Node.js (>= 20.19.0)
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose 9
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Sanitization:** `sanitize-html`
- **Logging:** `pino` & `pino-http` (with `pino-pretty` for development)
- **Testing:** Mocha, Chai, Chai-HTTP, Sinon

---

## Project Structure

```text
cohort-9-mern-12751-abubakar/
├── backend/
│   ├── config/              # Logger configuration (Pino)
│   ├── controllers/         # Request handlers (authController, notesController)
│   ├── middlewares/         # JWT protection middleware (authMiddleware)
│   ├── models/              # Mongoose schemas (User, Note)
│   ├── routes/              # Express route definitions (authRoutes, notesRoutes)
│   ├── test/                # Backend unit and integration tests (Mocha/Chai)
│   ├── utils/               # AppError, asyncHandler, sanitization, token helpers
│   ├── app.js               # Express application configuration
│   ├── server.js            # Server entry point & DB connection
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, NoteCard, RichTextEditor, PrivateRoute)
│   │   ├── context/         # React Context (AuthContext, ThemeContext)
│   │   ├── pages/           # View components (Dashboard, Editor, Reader, Profile, Login, SignUp)
│   │   ├── services/        # Axios API client, notes API, and JSON import/export
│   │   ├── tests/           # Component and page unit tests (Vitest)
│   │   ├── App.jsx          # Route configurations & layout shell
│   │   ├── main.jsx         # Application root mount
│   │   ├── index.css        # Tailwind & global resets
│   │   └── App.css          # Design tokens & glassmorphic styles
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v20.19.0 or later
- **npm**: v10+
- **MongoDB**: A running local instance or MongoDB Atlas URI

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create an environment file:**
   Create a `.env` file inside `backend/` using `.env.example` as a template:
   ```env
   # Server Port
   PORT=5000

   # MongoDB Connection String
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/notes-app?retryWrites=true&w=majority

   # Dedicated Test Database (Optional, for running tests)
   MONGO_URI_TEST=mongodb+srv://<username>:<password>@<cluster>/notes-app_test?retryWrites=true&w=majority

   # Environment & Logging
   NODE_ENV=development
   LOG_LEVEL=info

   # JWT Secret (minimum 32 characters long)
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   ```

4. **Start the backend server:**
   - Development mode (with auto-reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

   The server will run at `http://localhost:5000`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file inside `frontend/` (refer to `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open your browser at `http://localhost:5173`.

---

## API Reference

### Health Check
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | No |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account (`fullName`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Yes (Bearer Token) |

### Notes (`/api/notes`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | Get all notes for user (supports `?search=` and `?sortBy=`) | Yes (Bearer Token) |
| `POST` | `/api/notes` | Create a note (`title`, `content`, `tags`) | Yes (Bearer Token) |
| `GET` | `/api/notes/:id` | Get note by ID | Yes (Bearer Token) |
| `PUT` | `/api/notes/:id` | Update note by ID (`title`, `content`, `tags`) | Yes (Bearer Token) |
| `DELETE` | `/api/notes/:id` | Delete note by ID | Yes (Bearer Token) |

---

## Running Tests

### Backend Tests
Tests are written using Mocha, Chai, and Sinon.

```bash
cd backend
npm test
```

### Frontend Tests
Tests are configured using Vitest and React Testing Library.

```bash
cd frontend
# Run once
npm test

# Run in watch mode
npm run test:watch
```

---

## Backup / Import Schema Format

When exporting notes or preparing a JSON file for import, the schema adheres to the following structure:

```json
[
  {
    "title": "Meeting Notes",
    "content": "<p>Discuss project milestones and deliverables.</p>",
    "tags": ["work", "planning"]
  },
  {
    "title": "Grocery List",
    "content": "<ul><li>Milk</li><li>Eggs</li><li>Coffee</li></ul>",
    "tags": ["personal"]
  }
]
```

---

## License

This project was built as an educational assignment for Cohort 9 — MERN.
