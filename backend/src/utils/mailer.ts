import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

export function getMailer(): nodemailer.Transporter {
  if (!transporter) {
    if (env.SMTP_PASSWORD && env.SMTP_PASSWORD !== 'YOUR_SMTP_PASSWORD' && env.SMTP_PASSWORD !== 'dummy_password') {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    } else {
      // JSON / Mock transport for local testing
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }
  return transporter;
}

export async function sendVerificationOTP(toEmail: string, otp: string, name: string): Promise<boolean> {
  const mailer = getMailer();

  const html = `
    <div style="font-family: 'Playfair Display', Georgia, serif, sans-serif; max-width: 600px; margin: 0 auto; background: #0c3328; color: #fdfbf7; padding: 40px 30px; border-radius: 8px; border: 1px solid rgba(228, 197, 144, 0.3);">
      <h1 style="color: #e4c590; text-align: center; margin: 0 0 10px 0; letter-spacing: 0.15em;">KRILÉA</h1>
      <p style="text-align: center; color: #e4c590; text-transform: uppercase; font-size: 11px; letter-spacing: 0.25em; margin-bottom: 30px;">Timeless Jewellery</p>
      
      <p style="font-size: 16px; color: #f4ede1;">Dear ${name || 'Valued Customer'},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #d1dfd9;">Welcome to Kriléa. To verify your email address and activate your account, please enter the one-time verification code below:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <div style="display: inline-block; background: rgba(228, 197, 144, 0.15); border: 2px solid #e4c590; color: #e4c590; font-size: 32px; font-weight: bold; letter-spacing: 0.3em; padding: 14px 28px; border-radius: 6px; font-family: 'Courier New', Courier, monospace;">
          ${otp}
        </div>
      </div>
      
      <p style="font-size: 12px; color: #e4c590; text-align: center;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
      <p style="font-size: 12px; color: #8fa89f; text-align: center; margin-top: 15px;">If you did not attempt to create a Kriléa account, please ignore this email.</p>
      
      <hr style="border: 0; border-top: 1px solid rgba(228, 197, 144, 0.25); margin: 30px 0;" />
      <p style="text-align: center; font-size: 11px; color: #8fa89f; margin: 0;">© 2026 Kriléa Jewellery. All rights reserved.</p>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Kriléa Jewellery" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: `Your Kriléa Verification OTP is: ${otp}`,
      html,
    });
    console.log(`[Email Sent] Verification OTP sent to ${toEmail}:`, info.messageId || 'sent');
    return true;
  } catch (err: any) {
    console.error(`[Email Error] Failed sending verification OTP to ${toEmail}:`, err.message);
    return false;
  }
}

export async function sendPasswordResetOTP(toEmail: string, otp: string, name: string): Promise<boolean> {
  const mailer = getMailer();

  const html = `
    <div style="font-family: 'Playfair Display', Georgia, serif, sans-serif; max-width: 600px; margin: 0 auto; background: #0c3328; color: #fdfbf7; padding: 40px 30px; border-radius: 8px; border: 1px solid rgba(228, 197, 144, 0.3);">
      <h1 style="color: #e4c590; text-align: center; margin: 0 0 10px 0; letter-spacing: 0.15em;">KRILÉA</h1>
      <p style="text-align: center; color: #e4c590; text-transform: uppercase; font-size: 11px; letter-spacing: 0.25em; margin-bottom: 30px;">Password Recovery</p>
      
      <p style="font-size: 16px; color: #f4ede1;">Hello ${name || 'Customer'},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #d1dfd9;">We received a request to reset your password. Use the 6-digit verification code below to authorize your password change:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <div style="display: inline-block; background: rgba(228, 197, 144, 0.15); border: 2px solid #e4c590; color: #e4c590; font-size: 32px; font-weight: bold; letter-spacing: 0.3em; padding: 14px 28px; border-radius: 6px; font-family: 'Courier New', Courier, monospace;">
          ${otp}
        </div>
      </div>
      
      <p style="font-size: 12px; color: #e4c590; text-align: center;">This code expires in 15 minutes and can only be used once.</p>
      <p style="font-size: 12px; color: #8fa89f; text-align: center; margin-top: 15px;">If you did not request a password reset, your account is safe and you can safely ignore this email.</p>
      
      <hr style="border: 0; border-top: 1px solid rgba(228, 197, 144, 0.25); margin: 30px 0;" />
      <p style="text-align: center; font-size: 11px; color: #8fa89f; margin: 0;">© 2026 Kriléa Jewellery. All rights reserved.</p>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Kriléa Jewellery" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: `Your Kriléa Password Reset Code: ${otp}`,
      html,
    });
    console.log(`[Email Sent] Password reset OTP sent to ${toEmail}:`, info.messageId || 'sent');
    return true;
  } catch (err: any) {
    console.error(`[Email Error] Failed sending password reset OTP to ${toEmail}:`, err.message);
    return false;
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, name: string): Promise<boolean> {
  const mailer = getMailer();
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  const html = `
    <div style="font-family: 'Playfair Display', serif, sans-serif; max-width: 600px; margin: 0 auto; background: #0c3328; color: #fdfbf7; padding: 30px; border-radius: 4px;">
      <h1 style="color: #e4c590; text-align: center; margin-bottom: 20px;">KRILÉA</h1>
      <p style="font-size: 16px;">Hello ${name},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #f4ede1;">We received a request to reset your password for your Kriléa account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #e4c590; color: #0c3328; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 2px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #e4c590;">This link is valid for 1 hour and can only be used once.</p>
      <p style="font-size: 12px; color: #a3b8b0;">If you did not request a password reset, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid rgba(228, 197, 144, 0.3); margin: 30px 0;" />
      <p style="text-align: center; font-size: 11px; color: #a3b8b0;">© 2026 Kriléa Jewellery. All rights reserved.</p>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Kriléa Jewellery" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: 'Reset Your Kriléa Password',
      html,
    });
    console.log(`[Email Sent] Password reset link sent to ${toEmail}:`, info.messageId || 'json-transport');
    return true;
  } catch (err: any) {
    console.error(`[Email Error] Failed sending password reset to ${toEmail}:`, err.message);
    return false;
  }
}

export async function sendOrderConfirmationEmail(toEmail: string, orderData: {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: any;
}): Promise<boolean> {
  const mailer = getMailer();

  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid rgba(228,197,144,0.2);">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(228,197,144,0.2); text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(228,197,144,0.2); text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(228,197,144,0.2); text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: serif, sans-serif; max-width: 600px; margin: 0 auto; background: #0c3328; color: #fdfbf7; padding: 30px; border-radius: 4px;">
      <h1 style="color: #e4c590; text-align: center;">KRILÉA</h1>
      <p style="text-align: center; color: #e4c590; text-transform: uppercase; font-size: 11px; letter-spacing: 0.2em;">Order Confirmation</p>
      <p style="font-size: 16px;">Dear ${orderData.customerName},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #f4ede1;">Thank you for your order! Your order <strong>${orderData.orderNumber}</strong> has been received and confirmed.</p>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="color: #e4c590; text-align: left; border-bottom: 1px solid #e4c590;">
            <th style="padding: 8px;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px; font-size: 14px;">
        <h3 style="color: #e4c590; margin-top: 10px; font-size: 18px;">Total: ₹${orderData.totalAmount.toLocaleString('en-IN')}</h3>
      </div>

      <hr style="border: 0; border-top: 1px solid rgba(228, 197, 144, 0.3); margin: 30px 0;" />
      <p style="text-align: center; font-size: 11px; color: #a3b8b0; margin-top: 30px;">© 2026 Kriléa Jewellery.</p>
    </div>
  `;

  try {
    await mailer.sendMail({
      from: `"Kriléa Jewellery" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: `Your Kriléa Order Confirmation - ${orderData.orderNumber}`,
      html,
    });
    return true;
  } catch (err: any) {
    console.error(`[Email Error] Failed sending order confirmation to ${toEmail}:`, err.message);
    return false;
  }
}
