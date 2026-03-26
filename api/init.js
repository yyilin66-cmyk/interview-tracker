import { sql } from '@vercel/postgres';

// One-time database initialization endpoint
// Call this once after setting up Vercel Postgres: GET /api/init?token=YOUR_ADMIN_TOKEN
export default async function handler(req, res) {
  const token = req.query.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS available_slots (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        start_min INTEGER NOT NULL,
        duration_min INTEGER NOT NULL DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(date, start_min)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER REFERENCES available_slots(id),
        date TEXT NOT NULL,
        start_min INTEGER NOT NULL,
        duration_min INTEGER NOT NULL,
        booker_name TEXT NOT NULL,
        booker_email TEXT NOT NULL,
        booker_company TEXT,
        booker_position TEXT,
        meeting_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return res.status(200).json({ ok: true, message: 'Tables created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
