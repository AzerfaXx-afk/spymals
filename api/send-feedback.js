export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, message } = req.body;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY variable is missing on Vercel.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'SpyMals <onboarding@resend.dev>',
        to: 'adambox06@gmail.com',
        subject: `🕵️‍♂️ Nouveau Feedback Spymals - ${username}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto; border: 2px solid #000; border-radius: 12px; box-shadow: 4px 4px 0px #000;">
            <h2 style="text-transform: uppercase; letter-spacing: 0.05em; color: #aadd00; background: #0f172a; padding: 12px; border-radius: 8px; margin-top: 0;">🕵️‍♂️ Fiche de Suggestion Reçue</h2>
            <p><strong>Nom de l'agent:</strong> ${username}</p>
            <p><strong>Email de réponse:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
            <div style="background: #f8fafc; border-left: 4px solid #aadd00; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-style: italic; white-space: pre-wrap;">"${message}"</p>
            </div>
            <p style="font-size: 10px; color: #64748b; margin-top: 30px;">Envoyé automatiquement depuis la centrale de commandement Spymals.</p>
          </div>
        `
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Resend API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
