// ============================================================
// Email Template: Offer Accepted
// ============================================================

import { OfferAcceptedData } from '../email.types';

export function renderOfferAcceptedEmail(data: OfferAcceptedData): { subject: string; html: string; text: string } {
  const subject = 'Your KrishiSetu offer was accepted';

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
        <div style="display:inline-block;padding:4px 10px;background:#ecfdf5;border-radius:999px;font-size:11px;font-weight:700;color:#059669;margin-bottom:12px;">
          ✓ Deal Confirmed
        </div>
        <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#18181b;">
          Offer Accepted!
        </h1>
        <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello ${data.recipientName},<br/>
          Great news! <strong>${data.actorName}</strong> has accepted the agreed terms for <strong>${data.quantityQtl} Qtl ${data.commodityName}</strong> at <strong>₹${data.agreedPricePerQtl.toFixed(2)}/qtl</strong>.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;">
          <div style="font-size:12px;color:#166534;margin-bottom:4px;">Total Agreed Contract Value:</div>
          <div style="font-size:24px;font-weight:800;color:#15803d;">₹${data.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>

        <p style="margin:20px 0 0 0;font-size:13px;line-height:1.5;color:#71717a;">
          A confirmed transaction record has been created. Next steps include pickup logistics scheduling and escrow payment initialization.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Transaction Operations • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Your KrishiSetu offer was accepted

Hello ${data.recipientName},
${data.actorName} has accepted the offer for ${data.quantityQtl} Qtl ${data.commodityName} at ₹${data.agreedPricePerQtl.toFixed(2)}/qtl.
Total Contract Value: ₹${data.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

View logistics booking and transaction milestones on KrishiSetu.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
