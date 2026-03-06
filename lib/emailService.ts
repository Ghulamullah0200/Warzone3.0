import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create transporter using Gmail
const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
    }
});

export async function sendApprovalEmail(userEmail: string, username: string) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Warzone Account Has Been Approved! 🎮',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        background-color: #000000;
                        color: #ffffff;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: linear-gradient(135deg, #0a0a0a 0%, #1a0000 100%);
                        border: 2px solid #ff0033;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .header {
                        background: #ff0033;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        color: #000000;
                        font-size: 32px;
                        font-weight: 900;
                        letter-spacing: 3px;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .welcome-text {
                        font-size: 18px;
                        margin-bottom: 20px;
                        color: #ff0033;
                        font-weight: bold;
                    }
                    .message {
                        font-size: 14px;
                        line-height: 1.8;
                        margin-bottom: 30px;
                        color: #cccccc;
                    }
                    .button {
                        display: inline-block;
                        background: #ff0033;
                        color: #000000;
                        padding: 15px 40px;
                        text-decoration: none;
                        font-weight: 900;
                        font-size: 16px;
                        border-radius: 5px;
                        letter-spacing: 2px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .footer {
                        background: #0a0a0a;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666666;
                        border-top: 1px solid #333333;
                    }
                    .divider {
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #ff0033, transparent);
                        margin: 30px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>WARZONE</h1>
                    </div>
                    <div class="content">
                        <p class="welcome-text">WELCOME TO THE WARZONE, ${username.toUpperCase()}!</p>
                        
                        <p class="message">
                            Your account has been successfully approved and activated. You now have full access to our premium card marketplace.
                        </p>
                        
                        <div class="divider"></div>
                        
                        <p class="message">
                            <strong>What's Next?</strong><br>
                            • Log in to your account<br>
                            • Browse our exclusive card collection<br>
                            • Make secure purchases<br>
                            • Manage your balance and orders
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/login" class="button">
                                LOGIN NOW
                            </a>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p class="message" style="font-size: 12px; color: #888888;">
                            If you did not create this account, please ignore this email or contact support immediately.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Warzone. All rights reserved.</p>
                        <p>SECURE CONNECTION ESTABLISHED // ENCRYPTION: AES-256-GCM</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Approval email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}
