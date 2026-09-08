// ============================================================
// Email Template: Transaction Status & Logistics Update
// ============================================================

import { TransactionUpdateData } from '../email.types';

export function renderTransactionEmail(data: TransactionUpdateData): { subject: string; html: string; text: string } {
  const subject = `KrishiSetu transaction update: ${data.status}`;

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
          Transaction Milestone Updated
        </h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello ${data.recipientName},<br/>
          Your transaction (<strong>#${data.transactionId.slice(0, 8)}</strong>) for <strong>${data.quantityQtl} Qtl ${data.commodityName}</strong> has transitioned to status:
        </p>

        <div style="background:#f4f4f5;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:16px;font-weight:700;color:#09090b;">
          Status: <span style="color:#ef4d23;">${data.status}</span>
        </div>

        ${data.note ? `<p style="margin:8px 0;font-size:13px;color:#71717a;">Note: ${data.note}</p>` : ''}
        ${data.driverPhone ? `<p style="margin:8px 0;font-size:13px;color:#71717a;">Driver Phone: <strong>${data.driverPhone}</strong></p>` : ''}
        ${data.vehicleType ? `<p style="margin:8px 0;font-size:13px;color:#71717a;">Vehicle Type: <strong>${data.vehicleType}</strong></p>` : ''}

        <p style="margin:20px 0 0 0;font-size:12px;color:#a1a1aa;">
          Track live dispatch progress, e-weighment slips, and inspection certificates on the KrishiSetu portal.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Logistics Engine • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `KrishiSetu transaction update

Hello ${data.recipientName},
Transaction #${data.transactionId.slice(0, 8)} (${data.quantityQtl} Qtl ${data.commodityName}) is now: ${data.status}
${data.note ? `Note: ${data.note}\n` : ''}${data.driverPhone ? `Driver: ${data.driverPhone}\n` : ''}
Track details in the KrishiSetu portal.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
