import { sql } from '@vercel/postgres';
import { getUser } from './auth/me.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT b.*, s.date as slot_date, s.start_min as slot_start_min, s.duration_min as slot_duration_min
        FROM bookings b
        LEFT JOIN available_slots s ON s.id = b.slot_id
        WHERE b.user_id = ${user.userId}
        ORDER BY b.created_at DESC
        LIMIT 100
      `;
      return res.status(200).json({ bookings: rows });
    }

    if (req.method === 'DELETE') {
      const bookingId = req.query.id;
      if (!bookingId) return res.status(400).json({ error: 'Missing booking id' });

      // Fetch booking and verify ownership
      const { rows } = await sql`
        SELECT * FROM bookings WHERE id = ${bookingId} AND user_id = ${user.userId}
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

      const booking = rows[0];
      const startH = String(Math.floor(booking.start_min / 60)).padStart(2, '0');
      const startM = String(booking.start_min % 60).padStart(2, '0');
      const startTime = `${startH}:${startM}`;
      const endMin = booking.start_min + booking.duration_min;
      const endH = String(Math.floor(endMin / 60)).padStart(2, '0');
      const endM = String(endMin % 60).padStart(2, '0');
      const timeStr = `${startTime}-${endH}:${endM}`;

      // Send rejection email via Resend
      if (process.env.RESEND_API_KEY && booking.booker_email) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Interview Booking <onboarding@resend.dev>',
              to: booking.booker_email,
              subject: `Interview Booking Declined: ${booking.date} ${timeStr}`,
              html: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
                  <h2 style="color:#EF4444;margin-bottom:20px">Interview Booking Declined</h2>
                  <p style="color:#333;line-height:1.6">Hi ${booking.booker_name},</p>
                  <p style="color:#333;line-height:1.6">Unfortunately, your interview booking has been declined. Here are the details:</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <tr><td style="padding:8px 0;color:#666;width:80px">Date</td><td style="padding:8px 0;font-weight:600">${booking.date} (Beijing Time)</td></tr>
                    <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0;font-weight:600">${timeStr} BJT</td></tr>
                    ${booking.booker_company ? `<tr><td style="padding:8px 0;color:#666">Company</td><td style="padding:8px 0">${booking.booker_company}</td></tr>` : ''}
                    ${booking.booker_position ? `<tr><td style="padding:8px 0;color:#666">Position</td><td style="padding:8px 0">${booking.booker_position}</td></tr>` : ''}
                  </table>
                  <p style="color:#333;line-height:1.6">Please feel free to book another available time slot if needed.</p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error('Rejection email failed:', emailErr);
        }
      }

      // Remove corresponding round from user's board
      try {
        const { rows: dataRows } = await sql`
          SELECT items FROM user_data WHERE user_id = ${user.userId}
        `;
        const items = dataRows[0]?.items || [];
        const roundName = `${booking.booker_name} 约面`;
        let modified = false;

        for (let i = 0; i < items.length; i++) {
          const rounds = items[i].rounds || [];
          const idx = rounds.findIndex(r => r.name === roundName && r.date === booking.date && r.time === startTime);
          if (idx >= 0) {
            rounds.splice(idx, 1);
            items[i].rounds = rounds;
            modified = true;
            break;
          }
        }

        if (modified) {
          await sql`
            UPDATE user_data SET items = ${JSON.stringify(items)}::jsonb, updated_at = NOW()
            WHERE user_id = ${user.userId}
          `;
        }
      } catch (boardErr) {
        console.error('Failed to update board:', boardErr);
      }

      // Delete the booking
      await sql`DELETE FROM bookings WHERE id = ${bookingId} AND user_id = ${user.userId}`;

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
