import nodemailer from 'nodemailer';

const getSmtpConfig = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (process.env.SMTP_SERVICE) {
    return {
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  if (!process.env.SMTP_HOST) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

const buildResetEmailHtml = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #1a1a2e;">Password Reset Request</h2>
    <p>You requested a password reset for your TradeVault account.</p>
    <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
    <p style="margin: 32px 0;">
      <a href="${resetUrl}"
         style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Reset Password
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">
      If the button does not work, copy and paste this link into your browser:<br />
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p style="color: #666; font-size: 14px;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
`;

export const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.log(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return { sent: false, emailSent: false, resetUrl };
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"TradeVault" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request - TradeVault',
    text: `You requested a password reset. Open this link to set a new password (valid for 1 hour): ${resetUrl}`,
    html: buildResetEmailHtml(resetUrl),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  return {
    sent: true,
    emailSent: true,
    resetUrl,
    previewUrl,
  };
};
