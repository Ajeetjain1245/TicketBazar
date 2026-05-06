import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Nodemailer Transporter Configuration
 * Uses Gmail SMTP with App Password
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Use pooled connection for efficiency
  maxConnections: 5,
  maxMessages: 100,
});

/**
 * Verify transporter connection
 */
export const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✔ Mail server connection established');
    return true;
  } catch (error) {
    console.error('✘ Mail server connection failed:', error.message);
    return false;
  }
};

export default transporter;
