import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slot_id, name, email, company, position, notes } = req.body;

    if (!slot_id || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields: slot_id, name, email' });
    }

    // Check slot still available (use transaction to prevent race condition)
    const { rows: slotRows } = await sql`
      SELECT s.id, s.date, s.start_min, s.duration_min
      FROM available_slots s
      LEFT JOIN bookings b ON b.slot_id = s.id
      WHERE s.id = ${slot_id} AND b.id IS NULL
    `;

    if (slotRows.length === 0) {
      return res.status(409).json({ error: 'This slot is no longer available' });
    }

    const slot = slotRows[0];
    const startH = String(Math.floor(slot.start_min / 60)).padStart(2, '0');
    const startM = String(slot.start_min % 60).padStart(2, '0');
    const endMin = slot.start_min + slot.duration_min;
    const endH = String(Math.floor(endMin / 60)).padStart(2, '0');
    const endM = String(endMin % 60).padStart(2, '0');
    const timeStr = `${startH}:${startM}-${endH}:${endM}`;

    // Insert booking
    await sql`
      INSERT INTO bookings (slot_id, date, start_min, duration_min, booker_name, booker_email, booker_company, booker_position, notes)
      VALUES (${slot_id}, ${slot.date}, ${slot.start_min}, ${slot.duration_min}, ${name}, ${email}, ${company || null}, ${position || null}, ${notes || null})
    `;

    // Send email notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Interview Booking <onboarding@resend.dev>',
            to: process.env.NOTIFY_EMAIL || 'yyilin66@gmail.com',
            subject: `📅 New Interview Booking: ${name} from ${company || 'N/A'}`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
                <h2 style="color:#3B82F6;margin-bottom:20px">📅 New Interview Booking</h2>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#666;width:80px">Date</td><td style="padding:8px 0;font-weight:600">${slot.date} (Beijing Time)</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0;font-weight:600">${timeStr} BJT</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#666">Company</td><td style="padding:8px 0">${company || '-'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Position</td><td style="padding:8px 0">${position || '-'}</td></tr>
                  ${notes ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
                </table>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
        // Don't fail the booking if email fails
      }
    }

    return res.status(200).json({
      ok: true,
      booking: { date: slot.date, time: timeStr, name, company },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
