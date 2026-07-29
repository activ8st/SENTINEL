// Sentinel Email Dispatcher & Template Engine (Resend Integration)

export const createAutoresponderHtml = (name, message) => `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Conferma Ricezione — Sentinel</title>
</head>
<body style="margin:0; padding:0; background-color:#050505; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#050505; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#0c0c0c; border:1px solid rgba(255,255,255,0.12); border-radius:24px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.8);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background:linear-gradient(135deg, #09090b 0%, #051911 100%); padding:32px; border-bottom:1px solid rgba(16,185,129,0.2); text-align:center;">
              <img src="https://sentinel-italy.vercel.app/logo.svg" alt="Sentinel Logo" width="56" height="56" style="border-radius:14px; margin-bottom:12px;" />
              <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">Sentinel</h1>
              <p style="margin:4px 0 0 0; font-size:12px; color:#10b981; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Sicurezza Urbana Partecipata</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px 0; font-size:20px; font-weight:700; color:#ffffff;">Ciao ${name || 'Operatore'},</h2>
              <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:rgba(255,255,255,0.7);">
                Abbiamo preso in carico la tua richiesta inviata tramite la piattaforma **Sentinel**. La tua comunicazione è stata inoltrata con successo al nostro team operativo.
              </p>

              <!-- Highlight Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:16px; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:11px; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Riepilogo della tua comunicazione</div>
                    <div style="font-size:13px; color:rgba(255,255,255,0.9); font-style:italic; line-height:1.5;">"${message || 'Iscrizione prioritaria alla lista d\'attesa della piattaforma Sentinel.'}"</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px 0; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.6);">
                Un nostro referente esaminerà il messaggio e ti risponderà direttamente a questo indirizzo email entro 24 ore lavorative.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://sentinel-italy.vercel.app/" target="_blank" style="display:inline-block; background-color:#10b981; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:12px; box-shadow:0 4px 15px rgba(16,185,129,0.4);">
                      Accedi al Network Sentinel ➔
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background-color:#050505; padding:24px 32px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
              <p style="margin:0 0 8px 0; font-size:11px; color:rgba(255,255,255,0.4);">
                Sentinel Network Security &copy; ${new Date().getFullYear()} — Tutti i diritti riservati.
              </p>
              <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.3);">
                Milano Innovation District (MIND), Italia · <a href="https://sentinel-italy.vercel.app/" style="color:#10b981; text-decoration:none;">sentinel-italy.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const createAdminNotificationHtml = (name, email, message, city) => `
<!DOCTYPE html>
<html lang="it">
<body style="background-color:#050505; color:#ffffff; font-family:sans-serif; padding:20px;">
  <div style="max-width:600px; background:#0c0c0c; border:1px solid #10b981; padding:24px; border-radius:16px;">
    <h2 style="color:#10b981; margin-top:0;">🚨 Nuovo Lead Ricevuto su Sentinel</h2>
    <p><strong>Nome:</strong> ${name || 'N/D'}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${city ? `<p><strong>Città:</strong> ${city}</p>` : ''}
    <p><strong>Messaggio:</strong></p>
    <blockquote style="background:rgba(255,255,255,0.05); border-left:3px solid #10b981; padding:10px 15px; margin:0; font-style:italic;">
      ${message || 'Nessun messaggio scritto (Iscrizione lista d\'attesa)'}
    </blockquote>
    <p style="font-size:11px; color:gray; margin-top:20px;">Timestamp: ${new Date().toLocaleString('it-IT')}</p>
  </div>
</body>
</html>
`;
