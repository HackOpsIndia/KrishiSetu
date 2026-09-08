// ============================================================
// Email Template: Password Reset OTP
// ============================================================

import { PasswordResetEmailData } from '../email.types';

export function renderPasswordResetEmail(data: PasswordResetEmailData): { subject: string; html: string; text: string } {
  const subject = 'Reset your KrishiSetu password';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr>
      <td style="padding:28px 32px;background:#09090b;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;">
          Krishi<span style="color:#ef4d23;">Setu</span>
          <span style="font-size:12px;color:#a1a1aa;margin-left:8px;">कृषिसेतु</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#18181b;">
          Reset Your KrishiSetu Password
        </h1>
        <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello${data.name ? ` ${data.name}` : ''},<br/>
          We received a request to reset the password for your KrishiSetu account. Enter the verification code below to authorize setting a new password:
        </p>

        <div style="background:#fafafa;border:2px dashed #e4e4e7;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
          <div style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;margin-bottom:6px;">
            Password Reset Code
          </div>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#ef4d23;font-family:monospace;">
            ${data.otp}
          </div>
          <div style="font-size:12px;color:#71717a;margin-top:8px;">
            Expires in ${data.expiryMinutes} minutes
          </div>
        </div>

        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#991b1b;">
            <strong>Warning:</strong> If you did not request this password reset, please change your credentials immediately or contact KrishiSetu administrator.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Security Notification • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Reset your KrishiSetu password

Hello${data.name ? ` ${data.name}` : ''},

We received a request to reset your password.
Your reset code: ${data.otp} (Valid for ${data.expiryMinutes} minutes)

If you did not request this, please disregard or secure your account.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
