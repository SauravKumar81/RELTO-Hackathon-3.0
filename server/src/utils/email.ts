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
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .item-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
        .item-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
        .item-type { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
        .item-type.lost { background: #fef2f2; color: #dc2626; }
        .item-type.found { background: #f0fdf4; color: #16a34a; }
        .message-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .message-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
        .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Activity on Your Item</h1>
        </div>
        <div class="content">
          <p>Hi ${posterName},</p>
          <p>${actionText}</p>
          
          <div class="item-card">
            <span class="item-type ${itemType}">${itemType}</span>
            <div class="item-title">${itemTitle}</div>
          </div>

          ${initialMessage ? `
          <div class="message-box">
            <div class="message-label">Message from ${claimantName}:</div>
            <div>"${initialMessage}"</div>
          </div>
          ` : ''}

          <p>Log in to the app to respond and coordinate the return.</p>
          
          <p><strong>Remember:</strong> Never share personal contact information. Use the in-app chat to communicate safely.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Lost & Found</p>
          <p>You received this because someone responded to your item listing.</p>
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
    console.log(`[Email] Notification sent to ${to}`);
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
  }
};
