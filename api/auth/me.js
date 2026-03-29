import { sql } from '@vercel/postgres';
import { jwtVerify } from 'jose';

export async function getUser(req) {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth) return null;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || process.env.ADMIN_TOKEN || 'fallback-secret');
    const { payload } = await jwtVerify(auth, secret);
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { rows } = await sql`
      SELECT id, email, name, avatar_url, slug FROM users WHERE id = ${user.userId}
    `;
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    // Generate slug if missing
    const u = rows[0];
    if (!u.slug) {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let s = '';
      for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
      await sql`UPDATE users SET slug = ${s} WHERE id = ${u.id} AND slug IS NULL`;
      u.slug = s;
    }

    return res.status(200).json({ user: u });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
