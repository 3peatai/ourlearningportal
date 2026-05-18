export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, company, title, phone, email, replyVia } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `
    <h2 style="color:#0c7872;font-family:sans-serif">New contact form submission — Our Learning Portal</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Name</td><td style="padding:8px 0">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Phone</td><td style="padding:8px 0">${phone || '—'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Company</td><td style="padding:8px 0">${company || '—'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Title</td><td style="padding:8px 0">${title || '—'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0;color:#7e8c8a;font-weight:600">Preferred reply</td><td style="padding:8px 0">${replyVia}</td></tr>
    </table>
  `;

  const text = `New enquiry from ${firstName} ${lastName} (${email}) — prefers reply via ${replyVia}. Company: ${company || '—'}. Phone: ${phone || '—'}.`;

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
        reply_to: email,
        subject: `New enquiry: ${firstName} ${lastName}${company ? ` — ${company}` : ''}`,
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
