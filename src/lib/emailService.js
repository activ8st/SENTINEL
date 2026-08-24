// Sentinel Ultra-Luxury Email Templates & Dispatch Engine

export const createAutoresponderHtml = (name, message) => `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sentinel Network — Conferma Ricezione</title>
</head>
<body style="margin:0; padding:0; background-color:#030706; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff; -webkit-font-smoothing:antialiased;">
  
  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#030706; padding:48px 16px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px; background-color:#090d0b; border:1px solid rgba(16,185,129,0.25); border-radius:28px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(16,185,129,0.08);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:36px 36px 24px 36px; text-align:center; background:radial-gradient(ellipse at top, rgba(16,185,129,0.15) 0%, rgba(9,13,11,0) 70%); border-bottom:1px solid rgba(255,255,255,0.06);">
              <img src="https://sentinel-italy.vercel.app/logo.svg" alt="Sentinel Logo" width="60" height="60" style="border-radius:16px; margin-bottom:14px; box-shadow:0 8px 24px rgba(16,185,129,0.3);" />
              <h1 style="margin:0; font-size:26px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">SENTINEL</h1>
              <p style="margin:6px 0 0 0; font-size:11px; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:2px;">Network Security & Territorial Awareness</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              
              <!-- Status Badge -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:20px; padding:6px 14px; font-size:11px; font-weight:700; color:#34d399; text-transform:uppercase; letter-spacing:1px;">
                    ● RICEVUTA CONFERMATA · SISTEMA OPERATIVO
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 14px 0; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">Gentile ${name || 'Operatore'},</h2>
              
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:rgba(255,255,255,0.75);">
                Abbiamo preso in carico la tua comunicazione trasmessa attraverso il canale crittografato della piattaforma **Sentinel**. La tua segnalazione è stata registrata con la massima priorità nel nostro centro operativo.
              </p>

              <!-- Quote Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(255,255,255,0.02); border-left:3px solid #10b981; border-radius:0 16px 16px 0; margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font-size:10px; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">Estratto della Comunicazione</div>
                    <div style="font-size:13px; color:rgba(255,255,255,0.9); font-style:italic; line-height:1.5;">"${message || 'Iscrizione prioritaria al network di sicurezza territoriale Sentinel.'}"</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px 0; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.6);">
                Un referente qualificato del team Sentinel analizzerà il messaggio e fornirà riscontro diretto a questo indirizzo email entro 24 ore lavorative.
              </p>

              <!-- Luxury Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://sentinel-italy.vercel.app/" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; font-size:14px; font-weight:700; text-decoration:none; padding:16px 36px; border-radius:14px; box-shadow:0 10px 25px rgba(16,185,129,0.35); letter-spacing:0.3px;">
                      Esplora la Piattaforma Sentinel ➔
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#050806; padding:28px 36px; border-top:1px solid rgba(255,255,255,0.06); text-align:center;">
              <p style="margin:0 0 6px 0; font-size:11px; font-weight:600; color:rgba(255,255,255,0.4);">
                Sentinel Italy Security Network &copy; ${new Date().getFullYear()}
              </p>
              <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.3); line-height:1.5;">
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
<body style="background-color:#030706; color:#ffffff; font-family:sans-serif; padding:24px;">
  <div style="max-width:580px; background:#090d0b; border:1px solid #10b981; padding:28px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
    <h2 style="color:#10b981; margin-top:0;">🚨 Nuovo Lead Ricevuto su Sentinel</h2>
    <p style="font-size:14px;"><strong>Nome:</strong> ${name || 'N/D'}</p>
    <p style="font-size:14px;"><strong>Email:</strong> ${email}</p>
    ${city ? `<p style="font-size:14px;"><strong>Città:</strong> ${city}</p>` : ''}
    <p style="font-size:14px;"><strong>Messaggio:</strong></p>
    <blockquote style="background:rgba(255,255,255,0.04); border-left:3px solid #10b981; padding:12px 16px; margin:0; font-style:italic; font-size:13px;">
      ${message || 'Nessun messaggio scritto (Iscrizione lista d\'attesa)'}
    </blockquote>
    <p style="font-size:11px; color:gray; margin-top:24px;">Timestamp: ${new Date().toLocaleString('it-IT')}</p>
  </div>
</body>
</html>
`;
