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
        from: 'onboarding@resend.dev',
        to: 'adambox06@gmail.com',
        subject: `🕵️‍♂️ Nouveau Feedback Spymals - ${username}`,
        html: `
          <div style="background-color: #0b0f19; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; border-radius: 24px;">
            <div style="max-width: 550px; margin: auto; background-color: #151d30; border: 3px solid #000; border-radius: 28px; box-shadow: 6px 6px 0px #000; overflow: hidden; text-align: left;">
              
              <!-- Top Cyber Header Banner -->
              <div style="background-color: #aadd00; padding: 24px; border-bottom: 3px solid #000; text-align: center;">
                <span style="font-size: 40px; display: block; margin-bottom: 5px;">🕵️‍♂️</span>
                <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 0.1em;">
                  Fiche de Renseignement
                </h1>
                <div style="display: inline-block; margin-top: 8px; background-color: #000; color: #aadd00; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; letter-spacing: 0.15em;">
                  Suggestion Reçue
                </div>
              </div>
              
              <!-- Body Content -->
              <div style="padding: 24px; color: #ffffff;">
                
                <!-- Agent Badge -->
                <div style="background: rgba(255,255,255,0.05); border: 2.5px solid #000; border-radius: 20px; padding: 18px; margin-bottom: 24px; box-shadow: 4px 4px 0px #000;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="55" valign="middle">
                        <div style="width: 44px; height: 44px; border-radius: 99px; background-color: rgba(255,255,255,0.15); border: 1.5px solid #aadd00; text-align: center; line-height: 44px; font-size: 24px;">
                          👤
                        </div>
                      </td>
                      <td valign="middle" style="padding-left: 10px;">
                        <div style="font-size: 9px; color: #aadd00; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">EXPÉDITEUR</div>
                        <div style="font-size: 16px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.02em;">${username}</div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 700; margin-top: 1px;">${email}</div>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- Message Content -->
                <div style="margin-bottom: 24px;">
                  <div style="font-size: 9px; color: rgba(255,255,255,0.4); font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">TRANSMISSION</div>
                  <div style="background-color: #0c101a; border: 2.5px solid #000; border-radius: 20px; padding: 20px; box-shadow: inset 0px 2px 8px rgba(0,0,0,0.8); position: relative; overflow: hidden;">
                    <div style="font-size: 14px; line-height: 1.6; font-weight: 700; color: #e2e8f0; font-style: italic; white-space: pre-wrap;">
                      "${message}"
                    </div>
                  </div>
                </div>
                
                <!-- Action Reply Button -->
                <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
                  <a href="mailto:${email}" style="display: inline-block; background-color: #ff9f1c; color: #000; text-decoration: none; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 28px; border: 3px solid #000; border-radius: 18px; box-shadow: 4px 4px 0px #000;">
                    ✉️ RÉPONDRE À L'AGENT
                  </a>
                </div>

              </div>
              
              <!-- Footer -->
              <div style="background-color: #0c101a; padding: 16px 24px; border-top: 2.5px solid #000; text-align: center;">
                <span style="font-size: 9px; color: rgba(255,255,255,0.3); font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">
                  SpyMals HQ · Transmission Sécurisée par Resend
                </span>
              </div>

            </div>
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
