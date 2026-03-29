import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { rows } = await sql`
      SELECT b.*, u.slug, u.name as owner_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY b.created_at DESC
      LIMIT 50
    `;
    return res.status(200).json({ bookings: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
