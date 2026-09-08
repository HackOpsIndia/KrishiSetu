// ============================================================
// Email Template: Welcome & Onboarding
// ============================================================

import { WelcomeEmailData } from '../email.types';

export function renderWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string; text: string } {
  const subject = 'Welcome to KrishiSetu (कृषिसेतु)';

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
          Welcome to KrishiSetu, ${data.name}!
        </h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Your account has been successfully created with the role <strong>${data.role}</strong> and canonical email identity <strong>${data.email}</strong>.
        </p>
        <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#52525b;">
          KrishiSetu empowers farmers, FPOs, and corporate buyers with Net Realisable Price (NRP) intelligence, fair multi-round negotiation, collective pooling, and guaranteed escrow payments.
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:6px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#166534;">
            <strong>Next Step:</strong> Complete your profile and inspect live market opportunities from Pune APMC and institutional direct buyers.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Platform • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to KrishiSetu, ${data.name}!

Your account has been registered with role ${data.role} under ${data.email}.
Explore fair agricultural commerce and Net Realisable Price intelligence.

KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
