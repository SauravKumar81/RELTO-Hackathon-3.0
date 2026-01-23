import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface NotificationEmailParams {
  to: string;
  subject: string;
  posterName: string;
  claimantName: string;
  itemTitle: string;
  itemType: 'lost' | 'found';
  initialMessage?: string;
}

export const sendNotificationEmail = async (params: NotificationEmailParams): Promise<void> => {
  const { to, subject, posterName, claimantName, itemTitle, itemType, initialMessage } = params;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured, skipping email notification');
    return;
  }

  const actionText = itemType === 'found'
    ? `${claimantName} believes they are the owner of your found item.`
    : `${claimantName} may have found your lost item.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e5e7eb; background-color: #050505; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #050505; color: white; padding: 30px 20px; text-align: center; border-bottom: 1px solid #1f2937; }
        .logo { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 12px; }
        .brand { font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #22d3ee; margin: 0; text-transform: uppercase; }
        .content { background: #09090b; padding: 30px; border: 1px solid #1f2937; border-radius: 16px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
        .greeting { font-size: 18px; color: #fff; margin-top: 0; }
        .item-card { background: #18181b; padding: 20px; border-radius: 12px; border: 1px solid #27272a; margin: 24px 0; }
        .item-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 4px; display: block; }
        .item-title { font-size: 18px; font-weight: 600; color: #fff; margin: 0; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .badge.lost { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge.found { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .message-box { background: #131316; border-left: 3px solid #06b6d4; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
        .message-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #22d3ee; margin-bottom: 8px; font-weight: 600; }
        .message-text { color: #d4d4d8; font-style: italic; margin: 0; }
        .cta-button { display: inline-block; background: #06b6d4; color: #000; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 10px; text-align: center; width: 100%; box-sizing: border-box; }
        .footer { text-align: center; padding: 40px 20px; color: #52525b; font-size: 12px; }
        .footer p { margin: 5px 0; }
        .divider { height: 1px; background: #1f2937; margin: 24px 0; }
        .warning { color: #fbbf24; font-size: 13px; background: rgba(251, 191, 36, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.1); margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">RELTO</div>
        </div>
        
        <div class="content">
          <h2 class="greeting">Hi ${posterName},</h2>
          <p style="color: #d4d4d8;">${actionText}</p>
          
          <div class="item-card">
            <span class="badge ${itemType}">${itemType}</span>
            <span class="item-label">Item</span>
            <h3 class="item-title">${itemTitle}</h3>
          </div>

          ${initialMessage ? `
          <div class="message-box">
            <div class="message-label">Message from ${claimantName}</div>
            <p class="message-text">"${initialMessage}"</p>
          </div>
          ` : ''}

          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">View in RELTO</a>

          <div class="warning">
            <strong>Safety First:</strong> Never share personal contact information like phone numbers or home addresses. Use the secure in-app chat to coordinate safely.
          </div>
        </div>

        <div class="footer">
          <p>Sent via RELTO - The Lost & Found Community</p>
          <p>You received this email because of activity on your account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${posterName},

${actionText}

Item: ${itemTitle} (${itemType})
${initialMessage ? `\nMessage from ${claimantName}:\n"${initialMessage}"\n` : ''}

Log in to the app to respond and coordinate the return.

Remember: Never share personal contact information. Use the in-app chat to communicate safely.

---
This is an automated message from Lost & Found.
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Lost & Found" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
  }
};
