import { sql } from '@vercel/postgres';
import { getUser } from './auth/me.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Public: get available slots by user slug
      const slug = req.query.slug;
      if (!slug) return res.status(400).json({ error: 'Missing slug parameter' });

      // Resolve slug to user
      const { rows: userRows } = await sql`
        SELECT id, name FROM users WHERE slug = ${slug}
      `;
      if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
      const owner = userRows[0];

      const { rows } = await sql`
        SELECT s.id, s.date, s.start_min, s.duration_min
        FROM available_slots s
        LEFT JOIN bookings b ON b.slot_id = s.id
        WHERE s.user_id = ${owner.id}
          AND s.date >= to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
          AND b.id IS NULL
        ORDER BY s.date, s.start_min
      `;

      return res.status(200).json({ slots: rows, userName: owner.name });
    }

    if (req.method === 'POST') {
      // Authenticated: publish slots
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Not authenticated' });

      const { slots } = req.body;
      if (!Array.isArray(slots)) return res.status(400).json({ error: 'slots must be an array' });

      // Delete future unbooked slots for this user
      await sql`
        DELETE FROM available_slots
        WHERE user_id = ${user.userId}
          AND date >= to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
          AND id NOT IN (SELECT slot_id FROM bookings WHERE slot_id IS NOT NULL)
      `;

      // Insert new slots
      for (const s of slots) {
        await sql`
          INSERT INTO available_slots (user_id, date, start_min, duration_min)
          VALUES (${user.userId}, ${s.date}, ${s.start_min}, ${s.duration_min})
          ON CONFLICT (user_id, date, start_min) DO UPDATE SET duration_min = ${s.duration_min}
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
