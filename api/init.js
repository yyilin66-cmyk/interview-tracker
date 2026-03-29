import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const token = req.query.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // User data (interview items stored as JSON)
    await sql`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        items JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Available slots
    await sql`
      CREATE TABLE IF NOT EXISTS available_slots (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        start_min INTEGER NOT NULL,
        duration_min INTEGER NOT NULL DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date, start_min)
      )
    `;

    // Bookings
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER REFERENCES available_slots(id),
        user_id INTEGER REFERENCES users(id),
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

    // Add columns if missing
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`; } catch {}
    try { await sql`ALTER TABLE available_slots ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`; } catch {}
    try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`; } catch {}

    // Drop old unique constraint and add new one with user_id
    try {
      await sql`ALTER TABLE available_slots DROP CONSTRAINT IF EXISTS available_slots_date_start_min_key`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_slots_user_date_start ON available_slots(user_id, date, start_min)`;
    } catch {}

    return res.status(200).json({ ok: true, message: 'Tables created/updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
