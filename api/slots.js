import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Public: return future available slots that are NOT booked
      const { rows } = await sql`
        SELECT s.id, s.date, s.start_min, s.duration_min
        FROM available_slots s
        LEFT JOIN bookings b ON b.slot_id = s.id
        WHERE s.date >= to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
          AND b.id IS NULL
        ORDER BY s.date, s.start_min
      `;
      return res.status(200).json({ slots: rows });
    }

    if (req.method === 'POST') {
      // Admin only: publish available slots
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { slots } = req.body; // [{date, start_min, duration_min}]
      if (!Array.isArray(slots)) {
        return res.status(400).json({ error: 'slots must be an array' });
      }

      // Delete all future slots that have no bookings
      await sql`
        DELETE FROM available_slots
        WHERE date >= to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
          AND id NOT IN (SELECT slot_id FROM bookings WHERE slot_id IS NOT NULL)
      `;

      // Insert new slots
      for (const s of slots) {
        await sql`
          INSERT INTO available_slots (date, start_min, duration_min)
          VALUES (${s.date}, ${s.start_min}, ${s.duration_min})
          ON CONFLICT (date, start_min) DO UPDATE SET duration_min = ${s.duration_min}
        `;
      }

      return res.status(200).json({ ok: true, count: slots.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
