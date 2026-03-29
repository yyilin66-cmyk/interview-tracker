import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slot_id, name, email, company, position, meeting_link, notes } = req.body;

    if (!slot_id || !name || !email || !meeting_link) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check slot still available
    const { rows: slotRows } = await sql`
      SELECT s.id, s.user_id, s.date, s.start_min, s.duration_min
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
      INSERT INTO bookings (slot_id, user_id, date, start_min, duration_min, booker_name, booker_email, booker_company, booker_position, meeting_link, notes)
      VALUES (${slot_id}, ${slot.user_id}, ${slot.date}, ${slot.start_min}, ${slot.duration_min}, ${name}, ${email}, ${company || null}, ${position || null}, ${meeting_link}, ${notes || null})
    `;

    // Get slot owner's email for notification
    const { rows: ownerRows } = await sql`
      SELECT email, name FROM users WHERE id = ${slot.user_id}
    `;
    const ownerEmail = ownerRows[0]?.email;

    // Send email notification
    if (process.env.RESEND_API_KEY && ownerEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Interview Booking <onboarding@resend.dev>',
            to: ownerEmail,
            subject: `New Interview Booking: ${name} from ${company || 'N/A'}`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
                <h2 style="color:#3B82F6;margin-bottom:20px">New Interview Booking</h2>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#666;width:80px">Date</td><td style="padding:8px 0;font-weight:600">${slot.date} (Beijing Time)</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0;font-weight:600">${timeStr} BJT</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#666">Company</td><td style="padding:8px 0">${company || '-'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Position</td><td style="padding:8px 0">${position || '-'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Meeting</td><td style="padding:8px 0"><a href="${meeting_link}">${meeting_link}</a></td></tr>
                  ${notes ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
                </table>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }
    }

    // Add interview card to user's board
    try {
      const { rows: dataRows } = await sql`
        SELECT items FROM user_data WHERE user_id = ${slot.user_id}
      `;
      const items = dataRows[0]?.items || [];
      const startTime = `${String(Math.floor(slot.start_min / 60)).padStart(2, '0')}:${String(slot.start_min % 60).padStart(2, '0')}`;

      // Semantic company matching via MiniMax M2.7
      let existingIdx = -1;
      const interviewingItems = items.filter(it => it.stage === 'interviewing');

      if (company && interviewingItems.length > 0 && process.env.MINIMAX_API_KEY) {
        try {
          const companyList = interviewingItems.map(it => it.company);
          const matchRes = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'MiniMax-M1',
              max_tokens: 5000,
              messages: [{
                role: 'user',
                content: `你是一个公司名匹配助手。判断预约人填写的公司名"${company}"是否和以下列表中的某个公司是同一家（考虑中英文、简称、别名等）。

公司列表：
${companyList.map((c, i) => `${i}: ${c}`).join('\n')}

如果匹配到了，只返回该公司的序号数字（如 0、1、2）。如果没有匹配到任何公司，返回 -1。
只返回一个数字，不要解释。`
              }],
            }),
          });
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            const answer = (matchData.choices?.[0]?.message?.content || '-1').trim();
            const idx = parseInt(answer, 10);
            if (!isNaN(idx) && idx >= 0 && idx < companyList.length) {
              // Find the actual index in the full items array
              const matchedCompany = companyList[idx];
              existingIdx = items.findIndex(it => it.company === matchedCompany && it.stage === 'interviewing');
            }
          }
        } catch (aiErr) {
          console.error('MiniMax matching failed:', aiErr);
        }
      }

      // Fallback: simple string matching if AI didn't match
      if (existingIdx < 0 && company) {
        existingIdx = items.findIndex(it => it.company && it.company.toLowerCase() === company.toLowerCase() && it.stage === 'interviewing');
      }

      if (existingIdx >= 0) {
        // Add a new round to existing card
        if (!items[existingIdx].rounds) items[existingIdx].rounds = [];
        items[existingIdx].rounds.push({
          name: `${name} 约面`,
          date: slot.date,
          time: startTime,
          status: 'scheduled',
          emailLink: meeting_link,
        });
      } else {
        // Create new card
        const newItem = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          company: company || name,
          position: position || '待确认',
          stage: 'interviewing',
          prepLevel: 0,
          folderName: '',
          rounds: [{
            name: `${name} 约面`,
            date: slot.date,
            time: startTime,
            status: 'scheduled',
            emailLink: meeting_link,
          }],
          jd: '',
          notes: `预约人：${name}\n邮箱：${email}${notes ? '\n备注：' + notes : ''}`,
          createdAt: Date.now(),
        };
        items.push(newItem);
      }

      await sql`
        UPDATE user_data SET items = ${JSON.stringify(items)}::jsonb, updated_at = NOW()
        WHERE user_id = ${slot.user_id}
      `;
    } catch (boardErr) {
      console.error('Failed to update board:', boardErr);
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
