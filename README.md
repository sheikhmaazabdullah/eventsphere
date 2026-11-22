# 🌐 EventSphere — Expo Management Platform

> **MERN Stack eProject | Aptech ADSE | Sheikh Maaz Abdullah | Enrollment: 1335472**

A full-featured, production-ready Expo Management System built with MongoDB, Express, React, and Node.js. Features real-time updates via Socket.IO, an AI-powered exhibitor recommender, QR badge generation, and an interactive virtual floor plan tour.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Multi-Role Auth** | Admin, Exhibitor, Attendee — JWT-secured with bcrypt hashed passwords |
| **Expo Management** | Full CRUD for events, sessions, and floor plans |
| **Interactive Floor Plan** | Grid-based booth layout editor with real-time updates |
| **QR Badge Generator** | Unique QR-code badge per attendee per expo |
| **AI Recommender** | Jaccard-similarity content-based filtering |
| **Virtual Tour** | Animated auto-tour of expo floor with booth details |
| **Real-Time Updates** | Socket.IO for booth status, session seats, messages |
| **Messaging System** | In-platform chat between users |
| **Analytics Dashboard** | Recharts-powered stats for admins |

---

## 📁 Project Structure

```
eventsphere/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT protect + authorize
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expo.js
│   │   ├── Booth.js
│   │   ├── Session.js
│   │   ├── Registration.js
│   │   └── Message.js
│   ├── routes/               # Express routers + controllers
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── exhibitor.js
│   │   ├── attendee.js
│   │   └── expo.js
│   ├── utils/
│   │   ├── generateToken.js  # JWT helper
│   │   └── aiRecommender.js  # Content-based filtering
│   └── server.js             # Entry point + Socket.IO
│
└── frontend/                 # React + Vite + Tailwind CSS
    └── src/
        ├── context/          # AuthContext (global state)
        ├── hooks/            # useSocket (Socket.IO)
        ├── services/api.js   # Axios instance
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── admin/        # Dashboard, Expos, Floor, Analytics
        │   ├── exhibitor/    # Dashboard, Booth, Profile, Messages
        │   └── attendee/     # Dashboard, Events, Sessions, QR, AI, Tour
        └── components/
            └── common/       # Navbar, Sidebar, ProtectedRoute
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6+ running locally (or MongoDB Atlas URI)
- **npm** v9+

---

## 🛠️ Installation & Setup

### 1. Clone / Extract the project

```bash
cd eventsphere
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_super_secret_key_here_change_this
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

### Development (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev        # starts on http://localhost:5173
```

Open your browser at **http://localhost:5173**

### Quick Demo Accounts

Use the "Quick Demo Login" buttons on the Login page, or create manually:

| Role | Email | Password |
|---|---|---|
| Admin | admin@eventsphere.com | admin123 |
| Exhibitor | exhibitor@eventsphere.com | exhibitor123 |
| Attendee | attendee@eventsphere.com | attendee123 |

> **Note:** Seed these accounts by registering them via the app's Register page.

---

## 🏗️ Build for Production

### Backend
```bash
cd backend
npm start          # runs server.js directly
```

### Frontend
```bash
cd frontend
npm run build      # outputs to dist/
npm run preview    # preview production build locally
```

---

## 📦 Packaging for Submission

```bash
# From project root — zip everything except node_modules
zip -r EventSphere_Submission.zip eventsphere/ \
  --exclude "*/node_modules/*" \
  --exclude "*/.git/*" \
  --exclude "*/dist/*"
```

The submission ZIP will contain all source code. The evaluator runs `npm install` in each folder.

---

## 🔌 API Endpoints Reference

### Auth (`/api/auth`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |
| GET  | `/profile` | Get current user (protected) |
| PUT  | `/profile` | Update profile (protected) |

### Admin (`/api/admin`) — requires `admin` role
| Method | Route | Description |
|---|---|---|
| GET/POST | `/expos` | List / Create expos |
| PUT/DELETE | `/expos/:id` | Update / Delete expo |
| GET/POST | `/booths/:expoId` | Manage booths |
| PUT | `/booths/assign/:id` | Assign booth to exhibitor |
| GET/POST/PUT/DELETE | `/sessions/:expoId` | Session CRUD |
| GET | `/registrations/:expoId` | View all registrations |
| PUT | `/registrations/:id/status` | Approve / Reject |
| GET | `/analytics` | Platform stats |

### Exhibitor (`/api/exhibitor`) — requires `exhibitor` role
| Method | Route | Description |
|---|---|---|
| POST | `/register/:expoId` | Apply to exhibit |
| GET | `/my-registrations` | My expo registrations |
| GET | `/booths/:expoId` | View floor plan |
| PUT | `/booths/reserve/:id` | Reserve a booth |
| PUT | `/booths/update/:id` | Update booth details |

### Attendee (`/api/attendee`) — requires `attendee` role
| Method | Route | Description |
|---|---|---|
| GET | `/expos` | Browse published expos |
| POST | `/register/:expoId` | Register + generate QR |
| GET | `/my-registrations` | My registrations |
| GET | `/badge/:expoId` | QR badge data |
| GET | `/sessions/:expoId` | Session list |
| PUT | `/sessions/:id/book` | Book / unbook session |
| GET | `/recommendations/:expoId` | AI exhibitor matches |
| GET | `/floor/:expoId` | Floor plan (read-only) |

---

## 🌐 Socket.IO Events

| Event (emit) | Description |
|---|---|
| `join-expo` | Join expo room for real-time updates |
| `join-user` | Join personal room for notifications |
| `leave-expo` | Leave expo room |

| Event (listen) | Description |
|---|---|
| `booth-status-changed` | Booth reserved/occupied |
| `booth-updated` | Booth details changed |
| `session-updated` | Session seat count changed |
| `new-message` | Incoming chat message |
| `registration-status` | Application approved/rejected |

---

## 🔒 Security Highlights

- Passwords hashed with **bcrypt** (12 salt rounds)
- Routes protected by **JWT Bearer tokens** (30-day expiry)
- Role-based access via `authorize(...roles)` middleware
- Input validation with **express-validator** on all POST routes
- CORS restricted to `CLIENT_URL` only

---

## 🤖 AI Recommender Algorithm

The recommender in `backend/utils/aiRecommender.js` uses **Jaccard Similarity**:

```
Score = |Attendee_Interests ∩ Exhibitor_Tags| / |Attendee_Interests ∪ Exhibitor_Tags|
```

No external API — runs entirely in-process. Attendee interests and exhibitor tags/products/services are tokenised to lower-case word sets before scoring.

---

## 📞 Support

**Developer:** Sheikh Maaz Abdullah  
**Enrollment:** 1335472  
**Curriculum:** ADSE — Aptech FB Area, Karachi  
**Project Period:** May – June 2026

---

## 📸 Screenshots

See the [`screenshots/`](screenshots/) folder for the full set (21 screens: home, login/register, admin dashboard, expo and floor-plan management, exhibitor lead scanning and messaging, attendee badges, sessions, AI recommendations, virtual floor tour, schedules and ratings).

## 📄 Documentation

Full eProject documentation: [`docs/EventSphere_eProject_Documentation.pdf`](docs/EventSphere_eProject_Documentation.pdf)
