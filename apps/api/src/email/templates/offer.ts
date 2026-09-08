// ============================================================
// Email Template: New Offer Received
// ============================================================

import { OfferNotificationData } from '../email.types';

export function renderOfferEmail(data: OfferNotificationData): { subject: string; html: string; text: string } {
  const subject = 'New offer received on KrishiSetu';

  const formattedPrice = `₹${(data.pricePerQtl).toFixed(2)}`;
  const formattedNrp = data.netRealisablePricePerQtl
    ? `₹${(data.netRealisablePricePerQtl).toFixed(2)}/qtl`
    : 'Calculated in portal';

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
          New Purchase Offer Received
        </h1>
        <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#52525b;">
          Hello ${data.recipientName},<br/>
          <strong>${data.buyerName}</strong> has submitted an offer for your <strong>${data.quantityQtl} Qtl ${data.commodityName}</strong> lot.
        </p>

        <table width="100%" style="border-collapse:collapse;margin:20px 0;background:#fafafa;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7;">Buyer</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#18181b;border-bottom:1px solid #e4e4e7;text-align:right;">${data.buyerName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7;">Commodity / Quantity</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#18181b;border-bottom:1px solid #e4e4e7;text-align:right;">${data.quantityQtl} Qtl ${data.commodityName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7;">Gross Offer Price</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#18181b;border-bottom:1px solid #e4e4e7;text-align:right;">${formattedPrice}/qtl</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;color:#71717a;">Estimated Net Realisation (NRP)</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#ef4d23;text-align:right;">${formattedNrp}</td>
          </tr>
        </table>

        <p style="margin:20px 0 0 0;font-size:13px;line-height:1.5;color:#71717a;">
          You can accept this offer, submit a counteroffer, or compare it against nearby APMC mandis on your KrishiSetu dashboard.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
        KrishiSetu Market Notification • Team HackOps
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New offer received on KrishiSetu

Hello ${data.recipientName},
${data.buyerName} has submitted an offer of ${formattedPrice}/qtl for your ${data.quantityQtl} Qtl ${data.commodityName}.
Estimated NRP: ${formattedNrp}

Review or counter this offer on your KrishiSetu dashboard.
KrishiSetu Platform • Team HackOps`;

  return { subject, html, text };
}
