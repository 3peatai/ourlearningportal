export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, company, title, phone, email, replyVia, notes, path } = req.body;

  // Call path (step 1) only requires at least one field; form path requires name + email
  if (path === 'form' && (!firstName || !lastName || !email)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isCall = path === 'call';
  const subjectLabel = isCall ? 'Booking enquiry' : 'New enquiry';
  const nameStr = firstName && lastName ? `${firstName} ${lastName}` : '—';

  const html = `
    <h2 style="color:#0c7872;font-family:sans-serif">${subjectLabel} — Our Learning Portal</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${!isCall ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Name</td><td style="padding:8px 0">${nameStr}</td></tr>` : ''}
      ${email ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>` : ''}
      ${phone ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Phone</td><td style="padding:8px 0">${phone}</td></tr>` : ''}
      ${company ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Company</td><td style="padding:8px 0">${company}</td></tr>` : ''}
      ${title ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Title</td><td style="padding:8px 0">${title}</td></tr>` : ''}
      ${replyVia && !isCall ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Preferred reply</td><td style="padding:8px 0">${replyVia}</td></tr>` : ''}
      ${notes ? `<tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600;vertical-align:top">Notes</td><td style="padding:8px 0">${notes.replace(/\n/g, '<br/>')}</td></tr>` : ''}
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Via</td><td style="padding:8px 0">${isCall ? 'Booking call' : 'Contact form'}</td></tr>
    </table>
  `;

  const parts = [
    isCall ? 'Booking call enquiry' : `${nameStr} (${email})`,
    company ? `Company: ${company}` : null,
    title ? `Title: ${title}` : null,
    phone ? `Phone: ${phone}` : null,
    replyVia && !isCall ? `Reply via: ${replyVia}` : null,
    notes ? `Notes: ${notes}` : null,
  ].filter(Boolean);
  const text = parts.join(' · ');

  const subjectName = isCall
    ? `${company || 'Unknown company'}${title ? ` — ${title}` : ''}`
    : `${nameStr}${company ? ` — ${company}` : ''}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Our Learning Portal <noreply@ourlearningportal.com>',
        to: ['ryan@3peat.ai', 'mark@3peat.ai'],
        reply_to: email || undefined,
        subject: `${subjectLabel}: ${subjectName}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
