import transporter from '../config/mail.js';

/**
 * Base template wrapper for consistent branding
 */
const _getTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #f1f5f9; }
    .container { max-width: 600px; margin: 20px auto; background-color: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: -1px; text-decoration: none; }
    .content { padding: 40px; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #0f172a; }
    .button { display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2); }
    .highlight { color: #818cf8; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${process.env.FRONTEND_URL}" class="logo">TICKET BAZAR</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Ticket Bazar. All rights reserved.<br>
      High-Performance Ticket Reselling Platform
    </div>
  </div>
</body>
</html>
`;

/**
 * Generic send email function
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Ticket Bazar'}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send Account Verification Email
 */
export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  
  const content = `
    <h1 style="margin-top: 0;">Verify your email</h1>
    <p>Welcome to <span class="highlight">Ticket Bazar</span>! To complete your registration and start buying or selling tickets, please verify your email address by clicking the button below.</p>
    <a href="${verifyUrl}" class="button">Verify My Email</a>
    <p style="font-size: 13px; color: #64748b;">This link will expire in <span class="highlight">15 minutes</span>. If you didn't create an account, you can safely ignore this email.</p>
  `;

  return await sendEmail({
    email,
    subject: 'Confirm your account | Ticket Bazar',
    message: `Verify your email by visiting: ${verifyUrl}`,
    html: _getTemplate(content, 'Verify your email'),
  });
};

/**
 * Send Password Reset Email
 */
export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const content = `
    <h1 style="margin-top: 0;">Reset your password</h1>
    <p>You requested a password reset for your account. Click the button below to choose a new password.</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p style="font-size: 13px; color: #64748b;">This link will expire in <span class="highlight">15 minutes</span>. If you didn't request this, your password will remain unchanged.</p>
  `;

  return await sendEmail({
    email,
    subject: 'Password Reset Request | Ticket Bazar',
    message: `Reset your password by visiting: ${resetUrl}`,
    html: _getTemplate(content, 'Reset your password'),
  });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h1 style="margin-top: 0;">Welcome, ${name}!</h1>
    <p>Your account has been successfully verified. You're now a part of the <span class="highlight">Ticket Bazar</span> community!</p>
    <p>You can now:</p>
    <ul style="color: #94a3b8;">
      <li>Browse premium tickets for your favorite events.</li>
      <li>Sell your extra tickets securely.</li>
      <li>Get instant notifications for new listings.</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Explore Dashboard</a>
  `;

  return await sendEmail({
    email,
    subject: 'Welcome to Ticket Bazar!',
    message: `Welcome to Ticket Bazar, ${name}! Your account is now active.`,
    html: _getTemplate(content, 'Welcome!'),
  });
};

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (email, order) => {
  const content = `
    <h1 style="margin-top: 0;">Order Confirmed!</h1>
    <p>Thank you for your purchase. Your order <span class="highlight">#${order.orderNumber}</span> has been successfully placed and paid.</p>
    <div style="background-color: #0f172a; padding: 20px; border-radius: 16px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">Order Summary:</p>
      <h3 style="margin: 10px 0; color: #f1f5f9;">${order.ticketTitle || 'Ticket Purchase'}</h3>
      <p style="margin: 0; color: #818cf8;">Amount Paid: ₹${order.amount}</p>
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">Quantity: ${order.quantity}</p>
    </div>
    <p>The seller will transfer the ticket to you shortly. You can track your order status in your dashboard.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">View Order Details</a>
  `;

  return await sendEmail({
    email,
    subject: `Order Confirmed - #${order.orderNumber} | Ticket Bazar`,
    message: `Your order #${order.orderNumber} is confirmed. View details at the dashboard.`,
    html: _getTemplate(content, 'Order Confirmed'),
  });
};

export default sendEmail;
