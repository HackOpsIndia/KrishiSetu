// ============================================================
// Email Template: Account Security & Role Change Update
// ============================================================

import { SecurityAlertData } from '../email.types';

export function renderSecurityEmail(data: SecurityAlertData): { subject: string; html: string; text: string } {
  const subject = 'KrishiSetu account security update';

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
          Account Security Update
        </h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello ${data.recipientName},<br/>
          This is an automated notification to inform you that a security-sensitive event occurred on your KrishiSetu account (<strong>${data.email}</strong>):
        </p>

        <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:14px 16px;margin:16px 0;">
          <div style="font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
            ${data.eventType}
          </div>
          <div style="font-size:13px;color:#7f1d1d;line-height:1.5;">
            ${data.details}
          </div>
        </div>

        <table width="100%" style="font-size:12px;color:#71717a;margin:16px 0;">
          <tr>
            <td>Timestamp:</td>
            <td style="font-weight:600;text-align:right;">${data.timestamp.toISOString()}</td>
          </tr>
          ${data.ipAddress ? `<tr><td>IP Address:</td><td style="font-weight:600;text-align:right;">${data.ipAddress}</td></tr>` : ''}
        </table>

        <p style="margin:20px 0 0 0;font-size:12px;color:#a1a1aa;">
          If you did not authorize this action or believe your account has been compromised, contact the KrishiSetu State Administrator immediately.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Platform Security Operations • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `KrishiSetu account security update

Hello ${data.recipientName},
Security event on ${data.email}: ${data.eventType}
${data.details}
Timestamp: ${data.timestamp.toISOString()}

If you did not authorize this change, please contact platform administrators.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
