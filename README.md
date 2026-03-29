# Interview Tracker

A visual interview pipeline management tool for job seekers. Track all your job applications, interview rounds, preparation status, and notes in one place.

**Live Demo: [interviewtracker.org](https://interviewtracker.org/)**

![Interview Tracker](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- **Kanban Board** — Drag-and-drop cards across stages: Interviewing / Offer / Ended
- **Interview Rounds** — Track each round with date, time, status (scheduled/done), and meeting links
- **Timezone Conversion** — Automatic Beijing (UTC+8) to local time conversion for overseas candidates
- **Preparation Tracking** — 4-level prep status for each company (Not Started → JD Read → Prepared → Fully Prepared)
- **JD & Notes** — Store job descriptions and personal interview notes per company
- **Data Import/Export** — JSON-based data portability, import from file or paste
- **Booking System** — Shareable scheduling page for HR/interviewers to book time slots with you
- **Google OAuth Login** — Secure authentication with cloud data sync
- **Offline Mode** — Works without login using localStorage

## Tech Stack

- **Frontend**: React 19 + Vite 8 (single-file SPA, no router needed)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel Postgres
- **Auth**: Google OAuth 2.0 + JWT (via `jose`)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Vercel account (for backend & database)

### Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/interview-tracker.git
cd interview-tracker

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173`. Without backend setup, it works in offline mode with localStorage.

### Environment Variables (for full features)

Set these in your Vercel project settings:

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Vercel Postgres connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Project Structure

```
├── src/
│   ├── App.jsx          # Main app: kanban board, data management
│   ├── BookPage.jsx     # Public booking page for interviewers
│   ├── LoginPage.jsx    # Google OAuth login
│   └── main.jsx         # Entry point with routing
├── api/
│   ├── auth/            # Login & token verification
│   ├── items.js         # CRUD for interview items
│   ├── slots.js         # Available time slots
│   ├── book.js          # Booking creation
│   ├── bookings.js      # Booking management
│   ├── query.js         # DB query helper
│   └── init.js          # Database schema initialization
├── vercel.json          # Vercel routing config
└── package.json
```

## License

MIT
