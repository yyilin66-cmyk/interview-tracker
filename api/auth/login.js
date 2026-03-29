import { sql } from '@vercel/postgres';
import { SignJWT } from 'jose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    // Verify Google ID token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google token' });

    const gUser = await googleRes.json();
    const { sub: googleId, email, name, picture } = gUser;

    if (!googleId || !email) return res.status(401).json({ error: 'Invalid token payload' });

    // Generate random slug
    const randomSlug = () => {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let s = '';
      for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };

    // Check if user already exists
    const { rows: existing } = await sql`
      SELECT id, slug FROM users WHERE google_id = ${googleId}
    `;

    let slug;
    if (existing.length > 0 && existing[0].slug) {
      slug = existing[0].slug;
    } else {
      slug = randomSlug();
    }

    // Upsert user
    const { rows } = await sql`
      INSERT INTO users (google_id, email, name, avatar_url, slug)
      VALUES (${googleId}, ${email}, ${name || email}, ${picture || null}, ${slug})
      ON CONFLICT (google_id) DO UPDATE SET
        email = ${email},
        name = ${name || email},
        avatar_url = ${picture || null},
        slug = COALESCE(users.slug, ${slug})
      RETURNING id, google_id, email, name, avatar_url, slug
    `;
    const user = rows[0];

    // Ensure user_data row exists
    await sql`
      INSERT INTO user_data (user_id, items)
      VALUES (${user.id}, '[]'::jsonb)
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Create JWT session token
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || process.env.ADMIN_TOKEN || 'fallback-secret');
    const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
