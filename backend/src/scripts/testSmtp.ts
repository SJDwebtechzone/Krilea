import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function test() {
  console.log('Testing SMTP with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
    passLength: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD?.trim(),
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection & Authentication VERIFIED successfully!');
    
    const info = await transporter.sendMail({
      from: `"Kriléa Jewellery" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER || 'rxshannn20@gmail.com',
      subject: 'Kriléa SMTP Verification Test',
      html: '<h1 style="color: #0c3328;">Kriléa SMTP Connected</h1><p>Your SMTP is operational.</p>',
    });
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (err: any) {
    console.error('❌ SMTP Error:', err.message);
  }
}

test();
