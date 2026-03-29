import { sql } from '@vercel/postgres';
import { getUser } from './auth/me.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT items FROM user_data WHERE user_id = ${user.userId}
      `;
      return res.status(200).json({ items: rows[0]?.items || [] });
    }

    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

      await sql`
        INSERT INTO user_data (user_id, items, updated_at)
        VALUES (${user.userId}, ${JSON.stringify(items)}::jsonb, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          items = ${JSON.stringify(items)}::jsonb,
          updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
