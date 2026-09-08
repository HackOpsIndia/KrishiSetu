// ============================================================
// Email Template: Login & Verification OTP
// ============================================================

import { OtpEmailData } from '../email.types';

export function renderOtpEmail(data: OtpEmailData): { subject: string; html: string; text: string } {
  const isVerification = data.purpose === 'EMAIL_VERIFICATION';
  const subject = isVerification
    ? 'Verify your KrishiSetu email'
    : 'Your KrishiSetu login code';

  const heading = isVerification
    ? 'Verify Your Email Address'
    : 'Your One-Time Login Code';

  const actionNotice = isVerification
    ? 'Use the 6-digit code below to verify ownership of this email address on the KrishiSetu platform.'
    : 'Use the 6-digit code below to securely sign in to your KrishiSetu account.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
    <!-- Header -->
    <tr>
      <td style="padding:28px 32px;background:#09090b;text-align:left;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
          Krishi<span style="color:#ef4d23;">Setu</span>
          <span style="font-size:12px;color:#a1a1aa;margin-left:8px;font-weight:400;">कृषिसेतु</span>
        </div>
        <div style="font-size:11px;color:#71717a;margin-top:4px;letter-spacing:0.5px;text-transform:uppercase;">
          Agriculture Market-Decision Platform • SIH 2026
        </div>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#18181b;letter-spacing:-0.3px;">
          ${heading}
        </h1>
        <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello${data.name ? ` ${data.name}` : ''},<br/>
          ${actionNotice}
        </p>

        <!-- OTP Code Box -->
        <div style="background:#fafafa;border:2px dashed #e4e4e7;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <div style="font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
            Verification Code
          </div>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#ef4d23;font-family:monospace;">
            ${data.otp}
          </div>
          <div style="font-size:12px;color:#71717a;margin-top:10px;">
            Valid for <strong>${data.expiryMinutes} minutes</strong> • Single use only
          </div>
        </div>

        <!-- Security Warning -->
        <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;border-radius:6px;margin:24px 0;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9a3412;">
            <strong>Security Notice:</strong> Never share this code with anyone, including KrishiSetu agents or APMC staff. KrishiSetu officials will never ask for your authentication codes.
          </p>
        </div>

        <p style="margin:24px 0 0 0;font-size:12px;color:#a1a1aa;line-height:1.5;">
          If you did not request this login code, please safely disregard this email or contact support if you suspect unauthorized activity.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Platform • Government of Maharashtra Agricultural Operations Hub<br/>
        Team HackOps • Problem Statement SIH26132
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `KrishiSetu — ${heading}

Hello${data.name ? ` ${data.name}` : ''},

${actionNotice}

Your Verification Code: ${data.otp}
(Valid for ${data.expiryMinutes} minutes • Single use only)

Security Notice: Never share this code with anyone. KrishiSetu staff will never ask for your authentication codes.

If you did not request this code, please disregard this email.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
