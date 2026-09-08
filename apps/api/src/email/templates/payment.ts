// ============================================================
// Email Template: Payment Status & Settlement Update
// ============================================================

import { PaymentNotificationData } from '../email.types';

export function renderPaymentEmail(data: PaymentNotificationData): { subject: string; html: string; text: string } {
  const subject = 'KrishiSetu payment update';

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
          Payment Settlement Update
        </h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello ${data.recipientName},<br/>
          An escrow payment event has been processed for Transaction <strong>#${data.transactionId.slice(0, 8)}</strong>:
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:16px 0;text-align:center;">
          <div style="font-size:12px;color:#166534;margin-bottom:6px;">Settlement Amount</div>
          <div style="font-size:28px;font-weight:800;color:#15803d;">₹${data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:12px;font-weight:600;color:#047857;margin-top:6px;">Status: ${data.status}</div>
        </div>

        ${data.referenceNumber ? `<p style="margin:8px 0;font-size:13px;color:#71717a;">Reference Number: <strong>${data.referenceNumber}</strong></p>` : ''}
        ${data.method ? `<p style="margin:8px 0;font-size:13px;color:#71717a;">Payment Mode: <strong>${data.method}</strong></p>` : ''}

        <p style="margin:20px 0 0 0;font-size:12px;color:#a1a1aa;">
          All KrishiSetu transactions are backed by secure escrow smart routing to protect both farmer producers and wholesale buyers.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Escrow Operations Hub • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `KrishiSetu payment update

Hello ${data.recipientName},
Payment for Transaction #${data.transactionId.slice(0, 8)}:
Amount: ₹${data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Status: ${data.status}
${data.referenceNumber ? `Reference: ${data.referenceNumber}\n` : ''}
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
